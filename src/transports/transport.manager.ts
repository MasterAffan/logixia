import { EventEmitter } from 'events';
import { ITransport, IAsyncTransport, TransportLogEntry, TransportConfig, TransportEvents, TransportMetrics, TransportType } from '../types/transport.types';
import { LogEntry } from '../types';
import { ConsoleTransport } from './console.transport';
import { FileTransport } from './file.transport';
import { DatabaseTransport } from './database.transport';

export class TransportManager extends EventEmitter {
  private transports: Map<string, ITransport> = new Map();
  private metrics: Map<string, TransportMetrics> = new Map();
  private isShuttingDown = false;

  constructor(config: TransportConfig = {}) {
    super();
    this.setupTransports(config);
  }

  private setupTransports(config: TransportConfig): void {
    if (config.console) {
      const consoleTransport = new ConsoleTransport(typeof config.console === 'object' ? config.console : {});
      this.addTransport(consoleTransport, 'console');
    }

    // Setup file transports
    if (config.file) {
      const fileConfigs = Array.isArray(config.file) ? config.file : [config.file];
      fileConfigs.forEach((fileConfig, index) => {
        const fileTransport = new FileTransport(fileConfig);
        this.addTransport(fileTransport, `file-${index}`);
      });
    }

    // Setup database transports
    if (config.database) {
      const dbConfigs = Array.isArray(config.database) ? config.database : [config.database];
      dbConfigs.forEach((dbConfig, index) => {
        const dbTransport = new DatabaseTransport(dbConfig);
        this.addTransport(dbTransport, `database-${index}`);
      });
    }

    // Setup custom transports
    if (config.custom) {
      config.custom.forEach((transport, index) => {
        this.addTransport(transport, `custom-${index}`);
      });
    }
  }

  addTransport(transport: ITransport, id?: string): void {
    const transportId = id || `${transport.name}-${Date.now()}`;
    this.transports.set(transportId, transport);
    
    // Initialize metrics
    this.metrics.set(transportId, {
      name: transportId,
      type: this.getTransportType(transport),
      logsWritten: 0,
      errors: 0,
      lastWrite: new Date(),
      averageWriteTime: 0
    });

    this.emit('transport:added', transportId, transport);
  }

  removeTransport(id: string): boolean {
    const transport = this.transports.get(id);
    if (!transport) return false;

    this.transports.delete(id);
    this.metrics.delete(id);
    
    // Close transport if it has a close method
    if (transport.close) {
      transport.close().catch(error => {
        this.emit('error', error, id);
      });
    }

    this.emit('transport:removed', id);
    return true;
  }

  async write(entry: LogEntry): Promise<void> {
    // Convert LogEntry to TransportLogEntry
    const transportEntry: TransportLogEntry = {
      timestamp: new Date(entry.timestamp),
      level: entry.level,
      message: entry.message,
      ...(entry.payload && { data: entry.payload }),
      ...(entry.context && { context: entry.context }),
      ...(entry.traceId && { traceId: entry.traceId }),
      ...(entry.appName && { appName: entry.appName }),
      ...(entry.environment && { environment: entry.environment })
    };
    if (this.isShuttingDown) {
      throw new Error('TransportManager is shutting down');
    }

    const writePromises: Promise<void>[] = [];

    for (const [id, transport] of this.transports) {
      // Check if transport should handle this log level
      if (!this.shouldTransportHandle(transport, transportEntry.level)) {
        continue;
      }

      const writePromise = this.writeToTransport(id, transport, transportEntry);
      writePromises.push(writePromise);
    }

    // Wait for all transports to complete (or fail)
    const results = await Promise.allSettled(writePromises);
    
    // Check for any failures
    const failures = results.filter(result => result.status === 'rejected') as PromiseRejectedResult[];
    if (failures.length > 0) {
      const errors = failures.map(failure => failure.reason);
      this.emit('error', new Error(`Transport write failures: ${errors.join(', ')}`), 'multiple');
    }
  }

  private async writeToTransport(id: string, transport: ITransport, entry: TransportLogEntry): Promise<void> {
    const startTime = Date.now();
    const metrics = this.metrics.get(id)!;

    try {
      await transport.write(entry);
      
      // Update metrics
      const writeTime = Date.now() - startTime;
      metrics.logsWritten++;
      metrics.lastWrite = new Date();
      metrics.averageWriteTime = (metrics.averageWriteTime + writeTime) / 2;
      
      this.emit('log', entry);
    } catch (error) {
      metrics.errors++;
      this.emit('error', error, id);
      throw error;
    }
  }

  private shouldTransportHandle(transport: ITransport, level: string): boolean {
    if (!transport.level) return true;
    
    // Simple level comparison - you might want to implement proper level hierarchy
    const levels = ['error', 'warn', 'info', 'debug', 'trace', 'verbose'];
    const transportLevelIndex = levels.indexOf(transport.level.toLowerCase());
    const entryLevelIndex = levels.indexOf(level.toLowerCase());
    
    if (transportLevelIndex === -1 || entryLevelIndex === -1) return true;
    
    return entryLevelIndex <= transportLevelIndex;
  }

  private getTransportType(transport: ITransport): TransportType {
    if (transport.name === 'console') return 'console';
    if (transport.name === 'file') return 'file';
    if (transport.name === 'database') return 'database';
    return 'custom';
  }

  // Async transport management
  async waitForReady(): Promise<void> {
    const readyPromises: Promise<boolean>[] = [];

    for (const transport of this.transports.values()) {
      if (this.isAsyncTransport(transport)) {
        readyPromises.push(transport.isReady());
      }
    }

    if (readyPromises.length > 0) {
      await Promise.all(readyPromises);
    }
  }

  async flush(): Promise<void> {
    const flushPromises: Promise<void>[] = [];

    for (const [id, transport] of this.transports) {
      if (this.isBatchTransport(transport)) {
        const flushPromise = transport.flush().catch(error => {
          this.emit('error', error, id);
        });
        flushPromises.push(flushPromise);
      }
    }

    await Promise.allSettled(flushPromises);
    this.emit('flush', 'all', this.transports.size);
  }

  async close(): Promise<void> {
    this.isShuttingDown = true;

    // Flush all transports first
    await this.flush();

    // Close all transports
    const closePromises: Promise<void>[] = [];

    for (const [id, transport] of this.transports) {
      if (transport.close) {
        const closePromise = transport.close().catch(error => {
          this.emit('error', error, id);
        });
        closePromises.push(closePromise);
      }
    }

    await Promise.allSettled(closePromises);
    
    this.transports.clear();
    this.metrics.clear();
    this.removeAllListeners();
  }

  // Utility methods
  getTransports(): string[] {
    return Array.from(this.transports.keys());
  }

  getTransport(id: string): ITransport | undefined {
    return this.transports.get(id);
  }

  getMetrics(): TransportMetrics[] {
    return Array.from(this.metrics.values());
  }

  getMetricsForTransport(id: string): TransportMetrics | undefined {
    return this.metrics.get(id);
  }

  isTransportReady(id: string): Promise<boolean> {
    const transport = this.transports.get(id);
    if (!transport) return Promise.resolve(false);
    
    if (this.isAsyncTransport(transport)) {
      return transport.isReady();
    }
    
    return Promise.resolve(true);
  }

  // Type guards
  private isAsyncTransport(transport: ITransport): transport is IAsyncTransport {
    return 'isReady' in transport && typeof (transport as any).isReady === 'function';
  }

  private isBatchTransport(transport: ITransport): transport is import('../types/transport.types').IBatchTransport {
    return 'flush' in transport && typeof (transport as any).flush === 'function';
  }

  // Event handling helpers
  onLog(callback: (entry: TransportLogEntry) => void): void {
    this.on('log', callback);
  }

  onError(callback: (error: Error, transport: string) => void): void {
    this.on('error', callback);
  }

  onFlush(callback: (transport: string, count: number) => void): void {
    this.on('flush', callback);
  }

  onTransportAdded(callback: (id: string, transport: ITransport) => void): void {
    this.on('transport:added', callback);
  }

  onTransportRemoved(callback: (id: string) => void): void {
    this.on('transport:removed', callback);
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; details: Record<string, any> }> {
    const details: Record<string, any> = {};
    let healthy = true;

    for (const [id, transport] of this.transports) {
      try {
        if (this.isAsyncTransport(transport)) {
          const isReady = await transport.isReady();
          details[id] = { ready: isReady, type: this.getTransportType(transport) };
          if (!isReady) healthy = false;
        } else {
          details[id] = { ready: true, type: this.getTransportType(transport) };
        }
      } catch (error) {
        details[id] = { ready: false, error: (error as Error).message, type: this.getTransportType(transport) };
        healthy = false;
      }
    }

    return { healthy, details };
  }
}
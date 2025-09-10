export interface ITransport {
  name: string;
  level?: string | undefined;
  write(entry: TransportLogEntry): Promise<void>;
  close?(): Promise<void>;
}

export interface TransportLogEntry {
  timestamp: Date;
  level: string;
  message: string;
  data?: Record<string, any>;
  context?: string;
  traceId?: string;
  appName?: string;
  environment?: string;
}

// File Transport Configuration
export interface FileTransportConfig {
  filename: string;
  dirname?: string;
  maxSize?: string | number; // '10MB', '1GB' or bytes
  maxFiles?: number;
  datePattern?: string; // 'YYYY-MM-DD', 'YYYY-MM-DD-HH'
  zippedArchive?: boolean;
  format?: 'json' | 'text' | 'csv';
  level?: string;
  batchSize?: number;
  flushInterval?: number;
  rotation?: RotationConfig;
}

// Database Transport Configuration
export interface DatabaseTransportConfig {
  type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
  connectionString?: string;
  host?: string;
  port?: number;
  database: string;
  table?: string; // For SQL databases
  collection?: string; // For MongoDB
  username?: string;
  password?: string;
  ssl?: boolean;
  level?: string;
  batchSize?: number;
  flushInterval?: number; // milliseconds
}

// Console Transport Configuration
export interface ConsoleTransportConfig {
  level?: string;
  colorize?: boolean;
  timestamp?: boolean;
  format?: 'json' | 'text';
}

// Rotation Configuration
export interface RotationConfig {
  // Time-based rotation
  interval?: '1h' | '6h' | '12h' | '1d' | '1w' | '1m' | '1y';
  
  // Size-based rotation
  maxSize?: string | number; // '10MB', '100MB', '1GB'
  
  // File management
  maxFiles?: number;
  compress?: boolean;
  
  // Custom rotation function
  shouldRotate?: (currentFile: string, stats: FileStats) => boolean;
}

export interface FileStats {
  size: number;
  created: Date;
  modified: Date;
}

// Transport Factory Configuration
export interface TransportConfig {
  console?: ConsoleTransportConfig;
  file?: FileTransportConfig | FileTransportConfig[];
  database?: DatabaseTransportConfig | DatabaseTransportConfig[];
  custom?: ITransport[];
}

// Async Transport for database operations
export interface IAsyncTransport extends ITransport {
  flush(): Promise<void>;
  isReady(): Promise<boolean>;
}

// Transport Events
export interface TransportEvents {
  'log': (entry: TransportLogEntry) => void;
  'error': (error: Error, transport: string) => void;
  'rotate': (oldFile: string, newFile: string) => void;
  'flush': (transport: string, count: number) => void;
}

// Batch Transport for high-performance scenarios
export interface IBatchTransport extends ITransport {
  readonly batchSize?: number;
  readonly flushInterval?: number;
  addToBatch(entry: TransportLogEntry): void;
  flush(): Promise<void>;
}

export type TransportType = 'console' | 'file' | 'database' | 'custom';

export interface TransportMetrics {
  name: string;
  type: TransportType;
  logsWritten: number;
  errors: number;
  lastWrite: Date;
  averageWriteTime: number;
}
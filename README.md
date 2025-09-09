# Logixia 🚀

Logixia is a next-generation logging library built on top of NestJS Logger with advanced features including trace ID support, structured logging, and flexible formatting.

## Why Logixia?

## Features

- 🔍 **Trace ID Support** - Automatic trace ID generation and propagation using async hooks
- 🎨 **Multiple Formatters** - JSON, Text, and custom formatters
- ⚡ **Performance Timing** - Built-in timing methods for performance monitoring
- 🔧 **NestJS Integration** - Seamless integration with NestJS applications
- 🌈 **Colorized Output** - Beautiful console output with customizable colors
- 📊 **Structured Logging** - Rich metadata and context support
- 🔄 **Request Context Tracking** - HTTP request lifecycle tracking
- 🎯 **Child Loggers** - Create contextual child loggers

## Installation

```bash
npm install logixia
# or
yarn add logixia
# or
pnpm add logixia
```

## Quick Start

### Basic Usage

```typescript
import { createLogger } from 'logixia';

const logger = createLogger({
  appName: 'MyApp',
  environment: 'development'
});

await logger.info('Hello from Logixia!', { userId: 123 });
await logger.error('Something went wrong', { error: 'details' });
```

### NestJS Integration

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogixiaLoggerService } from 'logixia';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LogixiaLoggerService));
  await app.listen(3000);
}

bootstrap();
```

```typescript
// app.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';
import { getCurrentTraceId } from 'logixia';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  getHello(): string {
    this.logger.log('Processing GET / request');
    
    const traceId = getCurrentTraceId();
    this.logger.log(`Current trace ID: ${traceId}`);
    
    return 'Hello from Logixia!';
  }
}
```

### Timing Operations

```typescript
// Simple timing
logger.time('operation');
// ... do some work
await logger.timeEnd('operation');

// Async timing
const result = await logger.timeAsync('async-operation', async () => {
  // ... async work
  return 'result';
});
```

### Child Loggers

```typescript
const childLogger = logger.child('UserService', { userId: 123 });
await childLogger.info('User operation completed');
```

## Configuration

```typescript
import { createLogger, LogLevel } from 'logixia';

const logger = createLogger({
  appName: 'MyApp',
  environment: 'production',
  traceId: {
    enabled: true,
    generator: () => 'custom-trace-id',
    extractor: {
      header: ['x-trace-id', 'x-request-id'],
      query: ['traceId']
    }
  },
  format: {
    timestamp: true,
    colorize: false,
    json: true
  },
  levelOptions: {
    level: LogLevel.INFO,
    levels: {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
      trace: 'magenta'
    }
  }
});
```

## Middleware Setup

```typescript
// Express/NestJS middleware
import { traceMiddleware } from 'logixia';

app.use(traceMiddleware({
  enabled: true,
  extractor: {
    header: ['x-trace-id'],
    query: ['traceId']
  }
}));
```

## Custom Formatters

```typescript
import { JsonFormatter, TextFormatter } from 'logixia';

// JSON formatter
const jsonFormatter = new JsonFormatter({
  prettyPrint: true,
  includeTimestamp: true
});

// Text formatter
const textFormatter = TextFormatter.createDetailed();
```

## API Reference

### Logger Methods

- `error(message: string | Error, data?: Record<string, any>): Promise<void>`
- `warn(message: string, data?: Record<string, any>): Promise<void>`
- `info(message: string, data?: Record<string, any>): Promise<void>`
- `debug(message: string, data?: Record<string, any>): Promise<void>`
- `trace(message: string, data?: Record<string, any>): Promise<void>`
- `time(label: string): void`
- `timeEnd(label: string): Promise<number | undefined>`
- `timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T>`
- `setLevel(level: LogLevel): void`
- `getLevel(): LogLevel`
- `setContext(context: string): void`
- `getContext(): string | undefined`
- `child(context: string, data?: Record<string, any>): ILogger`
- `close(): Promise<void>`

### Utility Functions

- `getCurrentTraceId(): string | undefined`
- `generateTraceId(): string`
- `setTraceId(traceId: string, data?: Record<string, any>): void`
- `runWithTraceId<T>(traceId: string, fn: () => T, data?: Record<string, any>): T`

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
# Logixia 🚀

**A next-generation TypeScript logging library with advanced features, custom levels, and intelligent IntelliSense support**

[![npm version](https://badge.fury.io/js/logixia.svg)](https://badge.fury.io/js/logixia)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)

## ✨ Features

- 🎯 **TypeScript-First**: Full type safety with intelligent IntelliSense
- 🔧 **Custom Log Levels**: Define your own levels with custom colors and priorities
- 🔍 **Trace ID Support**: Built-in request tracing with async context tracking
- ⚡ **Performance Monitoring**: Built-in timing utilities and performance metrics
- 🎨 **Flexible Formatting**: Multiple output formats (console, JSON, custom)
- 🏗️ **NestJS Integration**: First-class support for NestJS applications
- 🌐 **Express Middleware**: Ready-to-use Express middleware for request tracking
- 👶 **Child Loggers**: Create contextual child loggers for better organization
- 🎛️ **Field Configuration**: Enable/disable and customize log fields
- 🔄 **Async Support**: Full async/await support with proper error handling
- 📊 **Structured Logging**: Rich metadata support for better log analysis

## 📦 Installation

```bash
# Using npm
npm install logixia

# Using yarn
yarn add logixia

# Using pnpm
pnpm add logixia
```

## 🚀 Quick Start

```typescript
import { createLogger, LogLevel } from 'logixia';

// Create a logger instance
const logger = createLogger({
  appName: 'MyApp',
  environment: 'development',
  levelOptions: {
    level: LogLevel.INFO,
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue'
    }
  }
});

// Basic logging
await logger.info('Application started', { version: '1.0.0' });
await logger.warn('High memory usage', { memory: '85%' });
await logger.error(new Error('Something went wrong'));

// Performance timing
logger.time('database-query');
// ... your code ...
await logger.timeEnd('database-query');

// Async timing
const result = await logger.timeAsync('api-call', async () => {
  return await fetch('/api/data');
});
```

## 🎯 Custom Log Levels

Define your own log levels with custom priorities and colors:

```typescript
import { createLogger } from 'logixia';

const logger = createLogger({
  appName: 'EcommerceApp',
  levelOptions: {
    level: 'info',
    levels: {
      // Standard levels
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      // Custom business levels
      order: 2,      // Order processing
      payment: 1,    // Payment processing (high priority)
      inventory: 2,  // Inventory management
      customer: 3,   // Customer interactions
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'blue',
      debug: 'green',
      order: 'brightBlue',
      payment: 'brightYellow',
      inventory: 'cyan',
      customer: 'brightGreen',
    }
  }
});

// Use custom levels with full TypeScript support
await logger.order('Order processing started', { orderId: '12345' });
await logger.payment('Payment processed', { amount: 99.99 });
await logger.inventory('Stock updated', { productId: 'ABC123', quantity: 50 });
```

## 🏗️ NestJS Integration

### Module Setup

```typescript
import { Module } from '@nestjs/common';
import { LogixiaLoggerModule } from 'logixia';

@Module({
  imports: [
    LogixiaLoggerModule.forRoot({
      appName: 'NestJS-App',
      environment: 'development',
      traceId: true,
      levelOptions: {
        level: 'debug',
        levels: {
          error: 0,
          warn: 1,
          info: 2,
          debug: 3,
          verbose: 4
        }
      }
    })
  ],
})
export class AppModule {}
```

### Service Usage

```typescript
import { Injectable } from '@nestjs/common';
import { LogixiaLoggerService } from 'logixia';

@Injectable()
export class UserService {
  constructor(private readonly logger: LogixiaLoggerService) {
    this.logger.setContext('UserService');
  }

  async findUser(id: string) {
    await this.logger.info('Fetching user', { userId: id });
    
    try {
      const user = await this.userRepository.findById(id);
      await this.logger.info('User found', { userId: id });
      return user;
    } catch (error) {
      await this.logger.error('User not found', { userId: id, error });
      throw error;
    }
  }

  async createUser(userData: any) {
    const childLogger = this.logger.child('createUser', { operation: 'create' });
    
    return await childLogger.timeAsync('user-creation', async () => {
      await childLogger.info('Creating user', { userData });
      const user = await this.userRepository.create(userData);
      await childLogger.info('User created', { userId: user.id });
      return user;
    });
  }
}
```

## 🌐 Express Integration

```typescript
import express from 'express';
import { createLogger, traceMiddleware, getCurrentTraceId } from 'logixia';

const app = express();
const logger = createLogger({ appName: 'ExpressApp' });

// Add trace middleware for request tracking
app.use(traceMiddleware({
  enabled: true,
  extractor: {
    header: ['x-trace-id', 'x-request-id'],
    query: ['traceId']
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    traceId: getCurrentTraceId(),
    userAgent: req.get('User-Agent')
  });
  next();
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const userLogger = logger.child('UserRoute', { userId: id });
  
  const userData = await logger.timeAsync('fetch-user', async () => {
    // Your database logic here
    return { id, name: 'John Doe' };
  });
  
  res.json(userData);
});
```

## 📊 Performance Monitoring

```typescript
import { createLogger } from 'logixia';

const logger = createLogger({
  appName: 'PerformanceApp',
  format: { json: true } // Better for parsing in production
});

class DatabaseService {
  async findUser(id: string) {
    // Simple timing
    logger.time(`db-find-user-${id}`);
    const user = await this.db.findById(id);
    const timeTaken = await logger.timeEnd(`db-find-user-${id}`);
    
    await logger.info('Database query completed', {
      operation: 'findUser',
      userId: id,
      timeTaken: `${timeTaken}ms`
    });
    
    return user;
  }
  
  async createUser(userData: any) {
    // Async timing with automatic logging
    return await logger.timeAsync('db-create-user', async () => {
      const user = await this.db.create(userData);
      await logger.info('User created', { userId: user.id });
      return user;
    });
  }
}
```

## 🎛️ Field Configuration

Customize which fields appear in your logs:

```typescript
const logger = createLogger({
  appName: 'CustomApp',
  fields: {
    timestamp: '[yyyy-mm-dd HH:MM:ss.MS]', // Custom format
    level: true,                            // Enable with default
    appName: false,                         // Disable
    traceId: true,                          // Enable
    message: true,                          // Enable
    payload: true,                          // Enable
    timeTaken: '[duration_ms]',             // Custom format
    context: '[CTX]',                       // Custom format
    environment: false                      // Disable
  }
});
```

## 👶 Child Loggers

Create contextual child loggers for better organization:

```typescript
const mainLogger = createLogger({ appName: 'MainApp' });

// Create child logger with additional context
const userLogger = mainLogger.child('UserService', { 
  module: 'user-management',
  version: '2.0' 
});

// Child logger inherits parent config but adds its own context
await userLogger.info('Processing user request'); // Includes UserService context

// Create nested child loggers
const operationLogger = userLogger.child('CreateUser', { 
  operation: 'create',
  requestId: 'req-123' 
});

await operationLogger.info('Validation started'); // Includes all parent contexts
```

## 🔍 Trace ID Support

Built-in request tracing across your application:

```typescript
import { createLogger, runWithTraceId, getCurrentTraceId } from 'logixia';

const logger = createLogger({ 
  appName: 'TracedApp',
  traceId: true 
});

// Manual trace ID management
runWithTraceId('custom-trace-123', async () => {
  await logger.info('Operation started'); // Automatically includes trace ID
  
  // Get current trace ID
  const traceId = getCurrentTraceId();
  console.log('Current trace:', traceId); // 'custom-trace-123'
  
  await someAsyncOperation();
  await logger.info('Operation completed'); // Same trace ID
});

// Automatic trace ID generation
runWithTraceId(async () => {
  await logger.info('Auto-generated trace ID');
});
```

## 🎨 Custom Formatters

Create your own log formatters:

```typescript
import { ILogFormatter, LogEntry } from 'logixia';

class CustomFormatter implements ILogFormatter {
  format(entry: LogEntry): string {
    return `🚀 [${entry.level.toUpperCase()}] ${entry.message} ${JSON.stringify(entry.payload || {})}`;
  }
}

const logger = createLogger({
  appName: 'CustomApp',
  formatters: [new CustomFormatter()]
});
```

## ⚙️ Configuration Options

```typescript
interface LoggerConfig {
  appName?: string;                    // Application name
  environment?: 'development' | 'production';
  traceId?: boolean | TraceIdConfig;   // Enable trace ID tracking
  format?: {
    timestamp?: boolean;               // Include timestamps
    colorize?: boolean;                // Colorize output
    json?: boolean;                    // JSON format output
  };
  silent?: boolean;                    // Disable all output
  levelOptions?: {
    level?: string;                    // Current log level
    levels?: Record<string, number>;   // Custom levels with priorities
    colors?: Record<string, LogColor>; // Custom colors for levels
  };
  fields?: Partial<Record<LogFieldKey, string | boolean>>; // Field configuration
}
```

## 📚 API Reference

### Core Logger Methods

```typescript
// Standard log levels
await logger.error(message: string | Error, data?: Record<string, any>);
await logger.warn(message: string, data?: Record<string, any>);
await logger.info(message: string, data?: Record<string, any>);
await logger.debug(message: string, data?: Record<string, any>);
await logger.trace(message: string, data?: Record<string, any>);
await logger.verbose(message: string, data?: Record<string, any>);

// Custom level logging
await logger.logLevel(level: string, message: string, data?: Record<string, any>);

// Timing methods
logger.time(label: string): void;
await logger.timeEnd(label: string): Promise<number | undefined>;
await logger.timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T>;

// Context management
logger.setContext(context: string): void;
logger.getContext(): string | undefined;
logger.setLevel(level: string): void;
logger.getLevel(): string;

// Child loggers
logger.child(context: string, data?: Record<string, any>): ILogger;

// Cleanup
await logger.close(): Promise<void>;
```

### NestJS Service Methods

```typescript
// NestJS LoggerService interface
log(message: any, context?: string): void;
error(message: any, trace?: string, context?: string): void;
warn(message: any, context?: string): void;
debug(message: any, context?: string): void;
verbose(message: any, context?: string): void;

// Extended Logixia methods
await info(message: string, data?: Record<string, any>): Promise<void>;
await trace(message: string, data?: Record<string, any>): Promise<void>;
getCurrentTraceId(): string | undefined;
child(context: string, data?: Record<string, any>): LogixiaLoggerService;
```

## 🧪 Examples

Check out the `/examples` directory for comprehensive usage examples:

- **Basic Usage** (`examples/basic-usage.ts`) - Simple logging setup
- **Custom Levels** (`examples/custom-levels.ts`) - Business-specific log levels
- **NestJS Integration** (`examples/nestjs-example.ts`) - Full NestJS setup
- **Express Integration** (`examples/express-example.ts`) - Express middleware
- **Performance Monitoring** (`examples/performance-monitoring.ts`) - Timing and metrics
- **Field Configuration** (`examples/field-configuration.ts`) - Custom field setup

## 🏃‍♂️ Running Examples

```bash
# Run basic usage example
npm run dev:basic-usage

# Run custom levels example
npm run dev:custom-levels

# Run NestJS example
npm run dev:nestjs

# Run Express example
npm run dev:express

# Run performance monitoring example
npm run dev:performance

# Run field configuration example
npm run dev:fields
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## 📋 Requirements

- **Node.js**: 16.0.0 or higher
- **TypeScript**: 5.0.0 or higher (for development)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript for maximum type safety
- Inspired by modern logging best practices
- Designed for scalable applications

---

**Made with ❤️ for the TypeScript community**
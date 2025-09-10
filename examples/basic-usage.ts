/**
 * Basic usage example of Logixia library
 */

import { createLogger, LogLevel } from '../src';

async function basicUsageExample() {
  // Create a logger with basic configuration
  const logger = createLogger({
    appName: 'ExampleApp',
    environment: 'development',
    format: {
      timestamp: true,
      colorize: true,
      json: false
    },
    levelOptions: {
      level: LogLevel.DEBUG,
      levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        trace: 4,
        verbose: 5
      },
      colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'magenta',
        verbose: 'cyan'
      }
    },
    
  });

  // Basic logging
  await logger.info('Application started', { version: '1.0.0' });
  await logger.debug('Debug information', { userId: 123, action: 'login' });
  await logger.warn('This is a warning', { memory: '85%' });
  
  // Error logging
  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    await logger.error(error as Error, { context: 'user-operation' });
  }

  // Timing operations
  logger.time('database-query');
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  await logger.timeEnd('database-query');

  // Async timing
  const result = await logger.timeAsync('api-call', async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return { data: 'API response' };
  });

  await logger.info('API call completed', { result });

  // Child logger
  const userLogger = logger.child('UserService', { userId: 456 });
  await userLogger.info('User operation started');
  await userLogger.debug('Processing user data', { operation: 'update' });

  // Context management
  logger.setContext('PaymentService');
  await logger.info('Payment processing started');
  
  console.log('Current context:', logger.getContext());

  // Level management
  logger.setLevel(LogLevel.WARN);
  await logger.debug('This will not be logged'); // Won't appear
  await logger.warn('This will be logged'); // Will appear

  await logger.close();
}

// Run the example
basicUsageExample().catch(console.error);
import { createLogger, LogLevel } from '../src';

/**
 * Example: Custom Log Levels and Colors
 * 
 * This example demonstrates how to:
 * 1. Define custom log levels like 'analytics', 'audit', 'security'
 * 2. Set custom colors for each level
 * 3. Use both predefined and custom levels
 */

// Example 1: Analytics Logger with Custom Levels
const analyticsLogger = createLogger({
  appName: 'AnalyticsApp',
  levelOptions: {
    level: 'analytics', // Set custom level as default
    levels: {
      // Predefined levels
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      [LogLevel.TRACE]: 4,
      [LogLevel.VERBOSE]: 5,
      // Custom levels
      'analytics': 1,  // Same priority as warn
      'audit': 0,      // Same priority as error
      'security': 0,   // Highest priority
      'performance': 3, // Same as debug,
      'nice': 1,
    },
    colors: {
      // Predefined colors
      [LogLevel.ERROR]: 'red',
      [LogLevel.WARN]: 'yellow',
      [LogLevel.INFO]: 'blue',
      [LogLevel.DEBUG]: 'green',
      [LogLevel.TRACE]: 'gray',
      [LogLevel.VERBOSE]: 'cyan',
      // Custom colors
      'analytics': 'magenta',
      'audit': 'brightRed',
      'security': 'brightMagenta',
      'performance': 'brightGreen',
      'nice': 'cyan',
    },
  }
});

// Example 2: E-commerce Logger with Business-Specific Levels
const ecommerceLogger = createLogger({
  appName: 'EcommerceApp',
  levelOptions: {
    level: 'info',
    levels: {
      // Standard levels
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      // Business-specific levels
      'order': 2,      // Order processing logs
      'payment': 1,    // Payment processing (higher priority)
      'inventory': 2,  // Inventory management
      'customer': 3,   // Customer interactions
      'marketing': 4,  // Marketing events
    },
    colors: {
      [LogLevel.ERROR]: 'red',
      [LogLevel.WARN]: 'yellow',
      [LogLevel.INFO]: 'blue',
      [LogLevel.DEBUG]: 'green',
      'order': 'brightBlue',
      'payment': 'brightYellow',
      'inventory': 'cyan',
      'customer': 'brightGreen',
      'marketing': 'brightCyan',
    }
  }
});

// Example 3: DevOps Logger with Infrastructure Levels
const devopsLogger = createLogger({
  appName: 'DevOpsApp',
  levelOptions: {
    level: 'info',
    levels: {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
      // Infrastructure levels
      'deployment': 1,
      'monitoring': 2,
      'scaling': 2,
      'backup': 3,
      'maintenance': 4,
    },
    colors: {
      [LogLevel.ERROR]: 'red',
      [LogLevel.WARN]: 'yellow',
      [LogLevel.INFO]: 'blue',
      [LogLevel.DEBUG]: 'green',
      'deployment': 'brightRed',
      'monitoring': 'brightBlue',
      'scaling': 'brightGreen',
      'backup': 'cyan',
      'maintenance': 'gray',
    }
  }
});

function demonstrateCustomLevels() {
  console.log('=== Custom Log Levels Demo ===\n');

  // Analytics Logger Demo
  console.log('1. Analytics Logger:');
  analyticsLogger.info('Application started');
  analyticsLogger.analytics('This will show because analytics level = 1, warn level = 1');
  analyticsLogger.info('This will NOT show because info level = 2 > analytics level = 1');
  analyticsLogger.nice('This will show because nice level = 4, warn level = 1');

  
  console.log('\n2. E-commerce Logger:');
  ecommerceLogger.error('Payment processing failed');
  ecommerceLogger.inventory('Low inventory warning');
  ecommerceLogger.info('This will NOT show because info level = 2 > payment level = 1');
  
  console.log('\n3. DevOps Logger:');
  devopsLogger.error('Server down');
  devopsLogger.warn('High CPU usage');
  devopsLogger.deployment('Deployment completed');
  devopsLogger.debug('This will NOT show because debug level = 3 > monitoring level = 2');

  console.log('\n4. Runtime Level Changes:');
  console.log('Changing analytics logger to debug level...');
  analyticsLogger.setLevel('debug');
  analyticsLogger.info('Now info messages will show');
  analyticsLogger.debug('And debug messages too');
  
  console.log('\n=== Custom Levels Demo Complete ===');
}

// Helper function to show available levels
function showAvailableLevels() {
  console.log('\n=== Available Log Levels ===');
  console.log('Predefined levels:', Object.values(LogLevel));
  console.log('\nCustom levels can be defined in levelOptions.levels');
  console.log('Examples: analytics, audit, security, order, payment, deployment, etc.');
  console.log('\nEach level gets a numeric priority (lower = higher priority)');
  console.log('And can have a custom color from the LogColor type');
}

if (require.main === module) {
  demonstrateCustomLevels();
  showAvailableLevels();
}

export {
  analyticsLogger,
  ecommerceLogger,
  devopsLogger,
  demonstrateCustomLevels,
  showAvailableLevels
};
/**
 * NestJS Integration Example for Logitron Logger
 * 
 * Note: To run this example, you need to install NestJS packages:
 * npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata
 */

import 'reflect-metadata';
import { Injectable, Controller, Get, Module } from '@nestjs/common';
import { LogixiaLoggerModule, LogixiaLoggerService } from '../src/core/logitron-logger.module';
import { LogixiaLogger } from '../src/core/logitron-logger';
import { LoggerConfig } from '../src/types';

// Simplified NestJS-like demonstration
class DemoUserService {
  private logger: LogixiaLogger;

  constructor() {
    // Initialize Logixia logger for this service
    this.logger = new LogixiaLogger({
      level: 'debug',
      service: 'UserService',
      environment: 'development',
      fields: {
        timestamp: true,
        level: true,
        context: true,
        traceId: true,
        message: true
      },
      formatters: ['text'],
      outputs: ['console'],
      levelOptions: {
        level: 'debug',
        levels: {
          error: 0,
          warn: 1,
          info: 2,
          debug: 3,
          verbose: 4
        },
        colors: {
          error: 'red',
          warn: 'yellow',
          info: 'green',
          debug: 'blue',
          verbose: 'cyan'
        }
      }
    });
  }

  async findAll() {
    this.logger.info('Fetching all users');
    
    // Simulate database operation with timing
    this.logger.time('db-query');
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const users = [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];
    
    this.logger.timeEnd('db-query');
    this.logger.info('Users fetched successfully', { count: users.length });
    
    return { users };
  }

  async findOne(id: string) {
    const childLogger = this.logger.child(`user-${id}`);
    childLogger.info('Fetching user by ID');
    
    try {
      // Simulate database lookup
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (id === '999') {
        throw new Error('User not found');
      }
      
      const user = { id, name: 'John Doe', email: 'john@example.com' };
      childLogger.info('User found', { user });
      
      return user;
    } catch (error) {
      childLogger.error('Failed to fetch user', { error });
      throw error;
    }
  }

  async create(userData: any) {
    const childLogger = this.logger.child('user-create');
    childLogger.info('Creating new user', { userData });
    
    try {
      // Simulate user creation
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      childLogger.info('User created successfully', { userId: newUser.id });
      return newUser;
    } catch (error) {
      childLogger.error('Failed to create user', { error });
      throw error;
    }
  }
}

// NestJS controller using proper decorators
@Controller('users')
class DemoUserController {
  private userService: DemoUserService;
  private logger: LogixiaLogger;

  constructor() {
    this.userService = new DemoUserService();
    this.logger = new LogixiaLogger({
       level: 'info',
       service: 'UserController',
       environment: 'development',
       fields: {
         timestamp: true,
         level: true,
         context: true,
         traceId: true,
         message: true,
       },
       formatters: ['text'],
       outputs: ['console'],
       levelOptions: {
         level: 'info',
         levels: {
           error: 0,
           warn: 1,
           info: 2,
           debug: 3,
           verbose: 4
         },
         colors: {
           error: 'red',
           warn: 'yellow',
           info: 'green',
           debug: 'blue',
           verbose: 'cyan'
         }
       }
     });
  }

  async getUsers() {
    this.logger.info('GET /users endpoint called');
    return await this.userService.findAll();
  }

  async getUser(id: string) {
    this.logger.info('GET /users/:id endpoint called', { userId: id });
    return await this.userService.findOne(id);
  }

  async createUser(userData: any) {
    this.logger.info('POST /users endpoint called');
    return await this.userService.create(userData);
  }
}

// NestJS Application Module using LogitronLoggerModule
@Module({
  imports: [
    LogixiaLoggerModule.forRoot({
      level: 'debug',
      service: 'NestJS-Demo',
      environment: 'development',
      traceId: true,
      formatters: ['text'],
      outputs: ['console']
    })
  ],
  providers: [DemoUserService],
  controllers: [DemoUserController]
})
class AppModule {}

// Simulate NestJS application setup
class DemoNestJSApp {
  private loggerService: LogixiaLoggerService;
  private userController: DemoUserController;

  constructor() {
    // Initialize the Logixia NestJS service
    this.loggerService = new LogixiaLoggerService({
       level: 'debug',
       service: 'NestJSApp',
       environment: 'development',
       fields: {
         timestamp: true,
         level: true,
         context: true,
         traceId: true,
         message: true
       },
       formatters: ['text'],
       outputs: ['console'],
       levelOptions: {
         level: 'debug',
         levels: {
           error: 0,
           warn: 1,
           info: 2,
           debug: 3,
           verbose: 4
         },
         colors: {
           error: 'red',
           warn: 'yellow',
           info: 'green',
           debug: 'blue',
           verbose: 'cyan'
         }
       }
     });

    this.userController = new DemoUserController();
  }

  async bootstrap() {
    const logger = this.loggerService.getLogger();
    
    logger.info('Starting NestJS application...');
    
    // Simulate middleware setup
    logger.debug('Setting up trace middleware');
    
    // Simulate route registration
    logger.debug('Registering routes', {
      routes: [
        'GET /users',
        'GET /users/:id',
        'POST /users'
      ]
    });
    
    logger.info('NestJS application started successfully', {
      port: 3000,
      environment: 'development'
    });
    
    return this;
  }

  async simulateRequests() {
    const logger = this.loggerService.getLogger();
    
    logger.info('Simulating HTTP requests...');
    
    try {
      // Simulate GET /users
      logger.info('Processing request: GET /users');
      await this.userController.getUsers();
      
      // Simulate GET /users/1
      logger.info('Processing request: GET /users/1');
      await this.userController.getUser('1');
      
      // Simulate POST /users
      logger.info('Processing request: POST /users');
      await this.userController.createUser({
        name: 'New User',
        email: 'newuser@example.com'
      });
      
      // Simulate error case
      logger.info('Processing request: GET /users/999 (error case)');
      try {
        await this.userController.getUser('999');
      } catch (error) {
        logger.warn('Request resulted in error (expected)', { error: error instanceof Error ? error.message : String(error) });
      }
      
    } catch (error) {
      logger.error('Unexpected error during request simulation', { error });
    }
  }
}

// Demo execution
async function runNestJSDemo() {
  console.log('\n=== NestJS + Logitron Integration Demo ===\n');
  
  const app = new DemoNestJSApp();
  
  // Bootstrap the application
  await app.bootstrap();
  
  // Simulate some requests
  await app.simulateRequests();
  
  console.log('\n=== Demo completed ===\n');
}

// Run the demo
runNestJSDemo().catch(console.error);

export { DemoNestJSApp, DemoUserController, DemoUserService };
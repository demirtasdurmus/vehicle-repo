import { MiddlewareConsumer, Module, NestModule, RequestMethod, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DynamicTestModule } from './lib/dynamic/dynamic-test.module';
import { HttpLogger } from './middlewares/http-logger.middleware';
import { CLogger, fLogger } from './middlewares/logger.middleware';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'vehicles',
      authSource: 'admin',
      socketTimeoutMS: 15000,
      connectionFactory(connection) {
        console.log(`Connected to ${connection.name} successfully`);
        return connection;
      },
    }),
    DynamicTestModule.forRoot('Im for dynamic root'),
    VehicleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CLogger, fLogger)
      .exclude({ path: 'others', method: RequestMethod.GET })
      .forRoutes({ path: 'dynamic', method: RequestMethod.ALL })
      .apply(HttpLogger)
      .forRoutes('*');
  }
}

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ModeratorsModule } from './moderators/moderators.module';
import { AuthMiddleware } from './middleware/authenticate.middleware';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [
    UsersModule,
    PostsModule,
    ModeratorsModule,
    CheckoutModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        'moderators/posts',
        'users/profile',
        'users/update',
        'users/delete',
        'users/follow-user/:id',
        'users/unfollow-user/:id',
        'posts/create',
        'posts/update/:id',
        'posts/delete/:id',
        'posts/all',
        'posts/feed',
        '/checkout',
      );
  }
}

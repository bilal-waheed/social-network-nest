import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { ModeratorsModule } from './moderators/moderators.module';
import { AuthMiddleware } from './middleware/authenticate.middleware';
import { CheckoutModule } from './checkout/checkout.module';
import { SocketsModule } from './sockets/sockets.module';

@Module({
  imports: [
    UsersModule,
    PostsModule,
    ModeratorsModule,
    CheckoutModule,
    SocketsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
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
        'moderators/posts',
        '/checkout',
      );
  }
}

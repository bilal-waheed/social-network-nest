import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsController } from './posts.controller';
import { PostSchema } from './posts.model';
import { PostsService } from './posts.service';
import { UserSchema } from '../users/users.model';
import { SocketsGateway } from '../sockets/sockets.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, SocketsGateway],
})
export class PostsModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostsController } from '../controllers/posts.controller';
import { PostSchema } from '../models/posts.model';
import { PostsService } from '../services/posts.service';
import { UserSchema } from '../models/users.model';
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

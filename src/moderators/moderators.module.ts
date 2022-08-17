import { Module } from '@nestjs/common';
import { ModeratorsController } from './moderators.controller';
import { ModeratorsService } from './moderators.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ModeratorSchema } from './moderators.model';
import { PostSchema } from '../posts/posts.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Moderator', schema: ModeratorSchema },
      { name: 'Post', schema: PostSchema },
    ]),
  ],
  controllers: [ModeratorsController],
  providers: [ModeratorsService],
})
export class ModeratorsModule {}

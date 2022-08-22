import { Module } from '@nestjs/common';
import { ModeratorsController } from '../controllers/moderators.controller';
import { ModeratorsService } from '../services/moderators.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ModeratorSchema } from '../models/moderators.model';
import { PostSchema } from '../models/posts.model';

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

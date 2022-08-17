import { Controller, Get, Param, Post } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  mainPosts() {
    return 'main posts route';
  }

  @Get(':id')
  getPost(@Param('id') postId: string) {
    return 'get single post route';
  }
}

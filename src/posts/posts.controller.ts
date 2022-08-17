import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('/create')
  async createPost(
    @Body('user') user: { id: string },
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const result = await this.postsService.createPost(user.id, title, content);
    return result;
  }

  @Patch('/update/:id')
  async updatePost(
    @Body('user') user: { id: string },
    @Param('id') postId: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    const result = await this.postsService.updatePost(
      postId,
      user.id,
      title,
      content,
    );
    return result;
  }

  @Delete('/delete/:id')
  async deletePost(
    @Body('user') user: { id: string },
    @Param('id') postId: string,
  ) {
    const result = await this.postsService.deletePost(postId, user.id);
    return result;
  }

  @Get('/all')
  async getAllPosts(
    @Body('user') user: { id: string },
    @Body('param') param: string,
    @Body('order') order: number,
    @Body('page') page: number,
  ) {
    const result = await this.postsService.getAllPosts(
      user.id,
      param,
      order,
      page,
    );
    return result;
  }

  @Get('/feed')
  async getFeed(
    @Body('user') user: { id: string },
    @Body('param') param: string,
    @Body('order') order: number,
    @Body('page') page: number,
  ) {
    const result = await this.postsService.getFeed(user.id, param, order, page);
    return result;
  }
}

import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { PostsService } from '../services/posts.service';
import { validatePaginationData } from 'src/validation/joi';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('/create')
  async createPost(
    @Body('user') user: { id: string },
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return await this.postsService.createPost(user.id, title, content);
  }

  @Patch('/update/:id')
  async updatePost(
    @Body('user') user: { id: string },
    @Param('id') postId: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return await this.postsService.updatePost(postId, user.id, title, content);
  }

  @Delete('/delete/:id')
  async deletePost(
    @Body('user') user: { id: string },
    @Param('id') postId: string,
  ) {
    return await this.postsService.deletePost(postId, user.id);
  }

  @Get('/all')
  async getAllPosts(
    @Body('user') user: { id: string },
    @Body('param') param: string,
    @Body('order') order: number,
    @Body('page') page: number,
  ) {
    const { value, error } = validatePaginationData({ param, order, page });

    if (error)
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);

    return await this.postsService.getAllPosts(
      user.id,
      value.param,
      value.order,
      value.page,
    );
  }

  @Get('/feed')
  async getFeed(
    @Body('user') user: { id: string },
    @Body('param') param: string,
    @Body('order') order: number,
    @Body('page') page: number,
  ) {
    const { value, error } = validatePaginationData({ param, order, page });

    if (error)
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);

    return await this.postsService.getFeed(
      user.id,
      value.param,
      value.order,
      value.page,
    );
  }
}

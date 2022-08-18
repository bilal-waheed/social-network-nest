import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post } from './posts.model';
import { User } from '../users/users.model';
import { SocketsGateway } from 'src/sockets/sockets.gateway';

@Injectable()
export class PostsService {
  PER_PAGE_ITEMS = 2;

  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly socketsGateway: SocketsGateway,
  ) {}

  async getAllPosts(
    id: string,
    param: string,
    order: number,
    pageNumber: number,
  ): Promise<any> {
    try {
      const orderSort = {};
      orderSort[param] = order;

      const postsCount = await this.postModel.find({ createdBy: id }).count();

      if (pageNumber * this.PER_PAGE_ITEMS >= postsCount + this.PER_PAGE_ITEMS)
        return { error: 'Page does not exist' };

      const posts = await this.postModel
        .find({ createdBy: id })
        .sort(orderSort)
        .skip((pageNumber - 1) * this.PER_PAGE_ITEMS)
        .limit(this.PER_PAGE_ITEMS);

      if (!posts)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Posts not found',
          },
          HttpStatus.NOT_FOUND,
        );

      const mappedPosts = posts.map((post) => ({
        _id: post.id,
        title: post.title,
        content: post.content,
        dateCreated: post.dateCreated,
      }));

      return {
        success: true,
        mappedPosts,
        totalPosts: postsCount,
        nextPage: Number(pageNumber) + 1,
        hasNextPage: pageNumber * this.PER_PAGE_ITEMS < postsCount,
        hasPrevPage: pageNumber > 1,
      };
    } catch (err) {
      return err;
    }
  }

  async createPost(id: string, title: string, content: string): Promise<any> {
    try {
      const newPost = new this.postModel({
        title: title,
        content: content,
        createdBy: id,
      });

      const savedPost = await newPost.save();

      this.socketsGateway.handleCreate(savedPost, 'New Post Created');

      return { success: true, post: savedPost };
    } catch (err) {
      return err;
    }
  }

  async getFeed(
    userId: string,
    param: string,
    order: number,
    pageNumber: number,
  ): Promise<any> {
    const orderSort = {};
    orderSort[param] = order;

    const user = await this.userModel.findOne({ _id: userId });
    if (user.type === 'unpaid')
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error:
            'Buy the subscription to view the feed. Go to {DOMAIN_NAME}/checkout',
        },
        HttpStatus.UNAUTHORIZED,
      );

    const { following } = user;

    const postsCount: number = await this.postModel
      .find({ createdBy: { $in: following } })
      .count();

    if (pageNumber * this.PER_PAGE_ITEMS >= postsCount + this.PER_PAGE_ITEMS)
      return { error: 'Page does not exist' };

    const posts = await this.postModel
      .find({ createdBy: { $in: following } })
      .sort(orderSort)
      .skip((pageNumber - 1) * this.PER_PAGE_ITEMS)
      .limit(this.PER_PAGE_ITEMS);

    if (!posts)
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'Posts not found',
        },
        HttpStatus.NOT_FOUND,
      );

    return {
      success: true,
      posts,
      totalPosts: postsCount,
      nextPage: Number(pageNumber) + 1,
      hasNextPage: pageNumber * this.PER_PAGE_ITEMS < postsCount,
      hasPrevPage: pageNumber > 1,
    };
  }

  async updatePost(
    postId: string,
    userId: string,
    title: string,
    content: string,
  ): Promise<any> {
    try {
      const post = await this.postModel.findOne({ _id: postId });

      if (!post)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Posts not found',
          },
          HttpStatus.NOT_FOUND,
        );

      if (post.createdBy !== userId)
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: "You cannot update another user's post",
          },
          HttpStatus.UNAUTHORIZED,
        );

      post.title = title ? title : post.title;
      post.content = content ? content : post.content;
      post.lastUpdated = Date.now().toString();

      const updatedPost = await post.save();

      this.socketsGateway.handleCreate(updatedPost, 'Post Updated');

      return {
        success: true,
        msg: 'Post updated successfully',
        updatedPost,
      };
    } catch (err) {
      return err;
    }
  }

  async deletePost(postId: string, userId): Promise<any> {
    try {
      const post = await this.postModel.findOneAndDelete({ _id: postId });
      if (!post)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Posts not found',
          },
          HttpStatus.NOT_FOUND,
        );

      if (post.createdBy !== userId)
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: "You cannot delete another user's post",
          },
          HttpStatus.UNAUTHORIZED,
        );

      return {
        success: true,
        msg: 'Post deleted successfully',
      };
    } catch (err) {
      return err;
    }
  }
}

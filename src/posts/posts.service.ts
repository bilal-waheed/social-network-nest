import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
    private readonly socketsGateway: SocketsGateway,
  ) {}

  async getAllPosts(
    id: string,
    param: string,
    order: number,
    pageNumber: number,
  ) {
    try {
      if (!(param && order && pageNumber))
        return { error: 'Query parameters required.' };

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

      if (!posts) return 'No posts found';

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

  async createPost(id: string, title: string, content: string) {
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
  ) {
    if (!(param && order && pageNumber))
      return { error: 'Query parameters required.' };

    const orderSort = {};
    orderSort[param] = order;

    const user = await this.userModel.findOne({ _id: userId });
    if (user.type === 'unpaid')
      return 'Buy the subscription to view the feed. Go to {DOMAIN_NAME}/checkout';

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

    if (!posts) return 'No posts found';

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
  ) {
    try {
      const post = await this.postModel.findOne({ _id: postId });

      if (!post) return { error: 'Post not found' };

      if (post.createdBy !== userId)
        return {
          error: 'You cannot update a post created by another user.',
        };

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

  async deletePost(postId: string, userId) {
    try {
      const post = await this.postModel.findOneAndDelete({ _id: postId });
      if (!post)
        return {
          error: 'Post does not exist',
        };

      if (post.createdBy !== userId)
        return {
          error: 'You cannot delete a post created by another user.',
        };

      return {
        success: true,
        msg: 'Post deleted successfully',
      };
    } catch (err) {
      return err;
    }
  }
}

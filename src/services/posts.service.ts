import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post } from '../interfaces/post.interface';
import { User } from '../interfaces/user.interface';
import { SocketsGateway } from 'src/sockets/sockets.gateway';

@Injectable()
export class PostsService {
  PER_PAGE_ITEMS = 2;

  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly socketsGateway: SocketsGateway,
  ) {}

  /**
   * Returns all the posts created by the currently authenticated user.
   * @param {string} id - mongo id of the user.
   * @param {string} param - parameter used for ordering.
   * @param {number} order - 1 for ascending, -1 for descending.
   * @param {number} pageNumber - page number .
   */
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
        throw new HttpException(
          'Requested page does not exist',
          HttpStatus.NOT_FOUND,
        );

      const posts = await this.postModel
        .find({ createdBy: id })
        .sort(orderSort)
        .skip((pageNumber - 1) * this.PER_PAGE_ITEMS)
        .limit(this.PER_PAGE_ITEMS);

      if (!posts)
        throw new HttpException('No posts found', HttpStatus.NOT_FOUND);

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

  /**
   * Create a post. Returns the created post
   * @param {string} id - mongo id of the authenticated user.
   * @param {string} title - title of the post.
   * @param {string} content - content of the post.
   */
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

  /**
   * Returns the feed of the currently authenticated user.
   * @param {string} id - mongo id of the user.
   * @param {string} param - parameter used for ordering.
   * @param {number} order - 1 for ascending, -1 for descending.
   * @param {number} pageNumber - page number .
   */
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
        'Buy the subscription to view the feed. Go to {DOMAIN_NAME}/checkout',
        HttpStatus.UNAUTHORIZED,
      );

    const { following } = user;

    const postsCount: number = await this.postModel
      .find({ createdBy: { $in: following } })
      .count();

    if (pageNumber * this.PER_PAGE_ITEMS >= postsCount + this.PER_PAGE_ITEMS)
      throw new HttpException(
        'Requested page does not exist',
        HttpStatus.NOT_FOUND,
      );

    const posts = await this.postModel
      .find({ createdBy: { $in: following } })
      .sort(orderSort)
      .skip((pageNumber - 1) * this.PER_PAGE_ITEMS)
      .limit(this.PER_PAGE_ITEMS);

    if (!posts) throw new HttpException('No posts found', HttpStatus.NOT_FOUND);

    return {
      success: true,
      posts,
      totalPosts: postsCount,
      nextPage: Number(pageNumber) + 1,
      hasNextPage: pageNumber * this.PER_PAGE_ITEMS < postsCount,
      hasPrevPage: pageNumber > 1,
    };
  }

  /**
   * Update a post. Returns the updated post
   * @param {string} postId - mongo id of the post to be updated.
   * @param {string} userId - mongo id of the authenticated user.
   * @param {string} title - title of the post.
   * @param {string} content - content of the post.
   */
  async updatePost(
    postId: string,
    userId: string,
    title: string,
    content: string,
  ): Promise<any> {
    try {
      const post = await this.postModel.findOne({ _id: postId });

      if (!post)
        throw new HttpException('No posts found', HttpStatus.NOT_FOUND);

      if (post.createdBy !== userId)
        throw new HttpException(
          "You cannot update another user's post",
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

  /**
   * Delete a post.
   * @param {string} postId - mongo id of the post to be updated.
   * @param {string} userId - mongo id of the authenticated user.
   */
  async deletePost(postId: string, userId): Promise<any> {
    try {
      const post = await this.postModel.findOneAndDelete({ _id: postId });
      if (!post)
        throw new HttpException('No posts found', HttpStatus.NOT_FOUND);

      if (post.createdBy !== userId)
        throw new HttpException(
          "You cannot delete another user's post",
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

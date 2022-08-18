import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

import { Moderator } from './moderators.model';
import { Post } from '../posts/posts.model';

@Injectable()
export class ModeratorsService {
  PER_PAGE_ITEMS = 2;

  constructor(
    @InjectModel('Moderator') private readonly moderatorModel: Model<Moderator>,
    @InjectModel('Post') private readonly postModel: Model<Post>,
  ) {}

  async signup(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
  ): Promise<any> {
    try {
      const mod = await this.moderatorModel.findOne({ username });
      if (mod) return { error: 'moderator already exists' };

      const newMod = new this.moderatorModel({
        firstName,
        lastName,
        username,
        email,
        password,
      });

      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(password, salt, (error, hash) => {
          if (error) throw error;

          newMod.password = hash;
        });
      });

      const modObj = await newMod.save();

      const token = jwt.sign(
        { id: modObj.id, userType: 'moderator' },
        process.env.SECRET_OR_PRIVATE_KEY,
        { expiresIn: '24h' },
      );

      return {
        success: true,
        msg: 'sign up successful',
        modObj,
        token,
      };
    } catch (err) {
      return err;
    }
  }

  async login(username: string, password: string): Promise<any> {
    try {
      // check if the moderator exists
      const mod = await this.moderatorModel.findOne({ username });
      if (!mod)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Moderator not found',
          },
          HttpStatus.NOT_FOUND,
        );

      // Comparing the password
      const isMatched = bcrypt.compare(password, mod.password);

      if (isMatched) {
        const token = jwt.sign(
          { id: mod.id, userType: 'moderator' },
          process.env.SECRET_OR_PRIVATE_KEY,
          { expiresIn: '24h' },
        );

        return { success: true, msg: 'login successful', mod, token };
      }

      return { error: 'password incorrect' };
    } catch (err) {
      return err;
    }
  }

  async getPosts(
    param: string,
    order: number,
    pageNumber: number,
  ): Promise<any> {
    try {
      const orderSort = {};
      orderSort[param] = order;

      const postsCount = await this.postModel.find().count();

      if (pageNumber * this.PER_PAGE_ITEMS >= postsCount + this.PER_PAGE_ITEMS)
        return { error: 'Page does not exist' };

      const posts = await this.postModel
        .find()
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
        nextPage: pageNumber + 1,
        hasNextPage: pageNumber * this.PER_PAGE_ITEMS < postsCount,
        hasPrevPage: pageNumber > 1,
      };
    } catch (err) {
      return err;
    }
  }
}

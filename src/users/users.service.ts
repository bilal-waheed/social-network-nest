import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Model } from 'mongoose';
import { User } from './users.model';
import { Post } from '../posts/posts.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Post') private readonly postModel: Model<Post>,
    private readonly configService: ConfigService,
  ) {}

  async signup(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
  ): Promise<any> {
    try {
      const user = await this.userModel.findOne({ username });

      if (user) return 'User already exists';

      const newUser = new this.userModel({
        firstName,
        lastName,
        username,
        email,
        password,
        followers: [],
        following: [],
        type: 'unpaid',
      });

      // Hashing the password
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;

        bcrypt.hash(password, salt, (error, hash) => {
          if (error) throw error;

          newUser.password = hash;
        });
      });

      const userObj = await newUser.save();

      const token = jwt.sign(
        { id: userObj.id, userType: 'user' },
        process.env.SECRET_OR_PRIVATE_KEY,
        { expiresIn: '24h' },
      );

      return {
        success: true,
        msg: 'sign up successful',
        userObj,
        token,
      };
    } catch (err) {
      return err;
    }
  }

  async login(username: string, password: string): Promise<any> {
    try {
      // check if the user exists
      const user = await this.userModel.findOne({ username });
      if (!user)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );

      // Comparing the password
      const isMatched = bcrypt.compare(password, user.password);
      if (isMatched) {
        const token = jwt.sign(
          { id: user.id, userType: 'user' },
          process.env.SECRET_OR_PRIVATE_KEY,
          { expiresIn: '7d' },
        );

        // sessionStorage.setItem('user-type', user.type);

        return { success: true, msg: 'login successful', user, token };
      }
      return { error: 'password incorrect' };
    } catch (err) {
      return err;
    }
  }

  async getProfile(id: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ _id: id });
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        type: user.type,
        followers: user.followers,
        following: user.following,
      };
    } catch (err) {
      return err;
    }
  }

  async updateProfile(
    id: string,
    body: {
      firstName?: string;
      lastName?: string;
      username?: string;
      email?: string;
      password?: string;
    },
  ): Promise<any> {
    try {
      const user = await this.userModel.findOne({ _id: id });

      if (!user)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );

      if (user.id !== id)
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Unauthorized',
          },
          HttpStatus.UNAUTHORIZED,
        );

      user.firstName = body.firstName ? body.firstName : user.firstName;
      user.lastName = body.lastName ? body.lastName : user.lastName;
      user.username = body.username ? body.username : user.username;
      user.email = body.email ? body.email : user.email;

      // re creating a hash for updated password
      if (body.password) {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;

          bcrypt.hash(body.password, salt, (error, hash) => {
            if (error) throw error;

            user.password = hash;
          });
        });
      }

      const updatedUser = await user.save();
      return {
        success: true,
        msg: 'User updated successfully',
        user: updatedUser,
      };
    } catch (err) {
      return err;
    }
  }

  async deleteUser(id: string): Promise<any> {
    try {
      const user = await this.userModel.findOneAndDelete({ _id: id });
      if (user.id !== id)
        return {
          error: 'Unauthorized.',
        };

      if (!user)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );

      const result = await this.postModel.deleteMany({ createdBy: id });

      return {
        success: true,
        msg: 'User deleted successfully',
      };
    } catch (err) {
      return err;
    }
  }

  async followUser(userId: string, selfId: string): Promise<any> {
    try {
      const userToFollow = await this.userModel.findOne({
        _id: userId,
      });

      if (!userToFollow)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );

      const user = await this.userModel.findOne({ _id: selfId });

      if (user.following.includes(userId))
        return { error: 'User already followed' };

      user.following.push(userId);

      await user.save();

      userToFollow.followers.push(selfId);

      userToFollow.save();

      return {
        success: true,
        msg: 'User followed successfully',
      };
    } catch (err) {
      return err;
    }
  }

  async unfollowUser(userId: string, selfId: string): Promise<any> {
    try {
      const userToUnfollow = await this.userModel.findOne({ _id: userId });

      if (!userToUnfollow)
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
          HttpStatus.NOT_FOUND,
        );

      const user = await this.userModel.findOne({ _id: selfId });

      const indexOfUserFollowing: number = user.following.findIndex(
        (id) => id === userId,
      );

      if (indexOfUserFollowing === -1) return { error: 'User not followed' };

      user.following.splice(indexOfUserFollowing, 1);

      await user.save();

      const indexToRemove = userToUnfollow.followers.findIndex(
        (id) => id === selfId,
      );

      user.followers.splice(indexToRemove, 1);

      await user.save();

      return {
        success: true,
        msg: 'User unfollowed successfully',
      };
    } catch (err) {
      return err;
    }
  }
}

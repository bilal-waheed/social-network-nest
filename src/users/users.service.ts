import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { Model } from 'mongoose';
import { User } from './users.model';
import { Post } from '../posts/posts.model';
import { validateLoginData, validateSignUpData } from 'src/validation/joi';

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
  ) {
    try {
      const user = await this.userModel.findOne({ username });

      if (user) return 'User already exists';

      const { value, error } = validateSignUpData({
        firstName,
        lastName,
        username,
        email,
        password,
      });

      if (error) return error.details[0].message;

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
        this.configService.get<string>('SECRET_OR_PRIVATE_KEY'),
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

  async login(username: string, password: string) {
    try {
      const { value, error } = validateLoginData({ username, password });

      if (error) return error.details[0].message;

      // check if the user exists
      const user = await this.userModel.findOne({ username });
      if (!user) return { error: 'User not found' };

      // Comparing the password
      const isMatched = bcrypt.compare(password, user.password);
      if (isMatched) {
        const token = jwt.sign(
          { id: user.id, userType: 'user' },
          this.configService.get<string>('SECRET_OR_PRIVATE_KEY'),
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

  async getProfile(id: string) {
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
  ) {
    try {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) return { error: 'User not found! Id is required' };

      if (user.id !== id) return { error: 'Unauthorized' };

      const { value, error } = validateSignUpData(body);

      if (error) return error.details[0].message;

      user.firstName = value.firstName ? value.firstName : user.firstName;
      user.lastName = value.lastName ? value.lastName : user.lastName;
      user.username = value.username ? value.username : user.username;
      user.email = value.email ? value.email : user.email;

      // re creating a hash for updated password
      if (value.password) {
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;

          bcrypt.hash(value.password, salt, (error, hash) => {
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

  async deleteUser(id: string) {
    try {
      const user = await this.userModel.findOneAndDelete({ _id: id });
      if (user.id !== id)
        return {
          error: 'Unauthorized.',
        };

      if (!user) return { error: 'User does not exist' };

      const result = await this.postModel.deleteMany({ createdBy: id });

      return {
        success: true,
        msg: 'User deleted successfully',
      };
    } catch (err) {
      return err;
    }
  }

  async followUser(userId: string, selfId: string) {
    try {
      const userToFollow = await this.userModel.findOne({
        _id: userId,
      });
      if (!userToFollow) return { error: 'User not found' };

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

  async unfollowUser(userId: string, selfId: string) {
    try {
      const userToUnfollow = await this.userModel.findOne({ _id: userId });
      if (!userToUnfollow) return { error: 'User not found' };

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

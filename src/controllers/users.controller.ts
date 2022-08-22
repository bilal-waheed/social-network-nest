import {
  Controller,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { validateLoginData, validateSignUpData } from 'src/validation/joi';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  async userSignUp(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const { value, error } = validateSignUpData({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    if (error)
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);

    return await this.usersService.signup(
      value.firstName,
      value.lastName,
      value.username,
      value.email,
      value.password,
    );
  }

  @Post('/login')
  async userLogin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const { value, error } = validateLoginData({ username, password });

    if (error)
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);

    return await this.usersService.login(value.username, value.password);
  }

  @Get('/profile')
  async getProfile(@Body('user') user: { id: string }) {
    return await this.usersService.getProfile(user.id);
  }

  @Patch('/update')
  async userUpdate(
    @Body('user') user: { id: string },
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
    @Body('username') username?: string,
    @Body('email') email?: string,
    @Body('password') password?: string,
  ) {
    const { value, error } = validateSignUpData({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    if (error)
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);

    return await this.usersService.updateProfile(user.id, value);
  }

  @Delete('/delete')
  async userDelete(@Body('user') user: { id: string }) {
    return await this.usersService.deleteUser(user.id);
  }

  @Patch('/follow-user/:id')
  async followUser(
    @Body('user') user: { id: string },
    @Param('id') idToFollow: string,
  ) {
    return await this.usersService.followUser(idToFollow, user.id);
  }

  @Patch('/unfollow-user/:id')
  async unfollowUser(
    @Body('user') user: { id: string },
    @Param('id') idToFollow: string,
  ) {
    return await this.usersService.unfollowUser(idToFollow, user.id);
  }
}

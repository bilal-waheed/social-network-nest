import {
  Controller,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Get,
} from '@nestjs/common';

import { UsersService } from './users.service';

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
    const result = await this.usersService.signup(
      firstName,
      lastName,
      username,
      email,
      password,
    );
    return result;
  }

  @Post('/login')
  async userLogin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const result = await this.usersService.login(username, password);
    return result;
  }

  @Get('/profile')
  async getProfile(@Body('user') user: { id: string }) {
    const result = await this.usersService.getProfile(user.id);
    return result;
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
    const result = await this.usersService.updateProfile(user.id, {
      firstName,
      lastName,
      username,
      email,
      password,
    });
    return result;
  }

  @Delete('/delete')
  async userDelete(@Body('user') user: { id: string }) {
    const result = await this.usersService.deleteUser(user.id);
    return result;
  }

  @Patch('/follow-user/:id')
  async followUser(
    @Body('user') user: { id: string },
    @Param('id') idToFollow: string,
  ) {
    const result = await this.usersService.followUser(idToFollow, user.id);
    return result;
  }

  @Patch('/unfollow-user/:id')
  async unfollowUser(
    @Body('user') user: { id: string },
    @Param('id') idToFollow: string,
  ) {
    const result = await this.usersService.unfollowUser(idToFollow, user.id);
    return result;
  }
}

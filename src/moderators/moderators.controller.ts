import { Body, Controller, Get, Post } from '@nestjs/common';

import { ModeratorsService } from './moderators.service';

@Controller('moderators')
export class ModeratorsController {
  constructor(private readonly moderatorsService: ModeratorsService) {}

  @Post('/signup')
  async moderatorSignup(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const result = await this.moderatorsService.signup(
      firstName,
      lastName,
      username,
      email,
      password,
    );
    return result;
  }

  @Post('/login')
  async moderatorLogin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const result = await this.moderatorsService.login(username, password);
    return result;
  }

  @Get('/posts')
  async getAllPosts() {
    const result = await this.moderatorsService.getPosts('dateCreated', 1, 1);
    console.log(result);
    return result;
  }
}

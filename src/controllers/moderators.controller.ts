import {
  Body,
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  validateLoginData,
  validatePaginationData,
  validateSignUpData,
} from 'src/validation/joi';

import { ModeratorsService } from '../services/moderators.service';

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
    const { value, error } = validateSignUpData({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    if (error)
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.details[0].message,
        },
        HttpStatus.BAD_REQUEST,
      );

    const result = await this.moderatorsService.signup(
      value.firstName,
      value.lastName,
      value.username,
      value.email,
      value.password,
    );

    return result;
  }

  @Post('/login')
  async moderatorLogin(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const { value, error } = validateLoginData({ username, password });

    if (error)
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);

    const result = await this.moderatorsService.login(
      value.username,
      value.password,
    );
    return result;
  }

  @Get('/posts')
  async getAllPosts(
    @Body('user') user: { id: string },
    @Body('param') param: string,
    @Body('order') order: number,
    @Body('page') page: number,
  ) {
    const { value, error } = validatePaginationData({ param, order, page });

    if (error) {
      throw new HttpException(error.details[0].message, HttpStatus.BAD_REQUEST);
    }
    const result = await this.moderatorsService.getPosts(
      value.param,
      value.order,
      value.page,
    );
    console.log(result);
    return result;
  }
}

import {
  ForbiddenException,
  HttpException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction, response } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token: string =
      req.body.token || req.query.token || req.headers.token;

    if (!token)
      throw new Error('Access denied. A token is required for authentication.');
    console.log(token);
    try {
      const verified = jwt.verify(
        token,
        this.configService.get<string>('SECRET_OR_PRIVATE_KEY'),
      );
      req.body = { ...req.body, user: verified };
    } catch (err) {
      console.log(err);
      throw new ForbiddenException();
    }
    return next();
  }
}

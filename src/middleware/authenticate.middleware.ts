import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token: string =
      req.body.token || req.query.token || req.headers.token;

    if (!token)
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized. Login required',
        },
        HttpStatus.UNAUTHORIZED,
      );

    try {
      const verified = jwt.verify(token, process.env.SECRET_OR_PRIVATE_KEY);
      const url = req.originalUrl.split('/')[1];
      const { userType } = verified;
      if (url == 'moderators' && userType == 'user')
        throw new ForbiddenException();

      req.body = { ...req.body, user: verified };
    } catch (err) {
      throw new ForbiddenException();
    }
    return next();
  }
}

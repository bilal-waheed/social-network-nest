import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { UserSchema } from 'src/users/users.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}

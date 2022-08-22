import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CheckoutService } from '../services/checkout.service';
import { CheckoutController } from '../controllers/checkout.controller';
import { UserSchema } from 'src/models/users.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}

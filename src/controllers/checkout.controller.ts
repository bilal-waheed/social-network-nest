import { Controller, Post, Body } from '@nestjs/common';

import { CheckoutService } from '../services/checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('/')
  async checkout(
    @Body('user') user: { id: string },
    @Body('email') email: string,
  ) {
    return await this.checkoutService.checkout(user.id, email);
  }
}

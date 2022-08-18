import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import Stripe from 'stripe';
import { Model } from 'mongoose';
import { User } from '../users/users.model';

@Injectable()
export class CheckoutService {
  private stripe;
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    this.stripe = new Stripe(process.env.STRIPE_API, {
      apiVersion: '2022-08-01',
    });
  }

  async checkout(userId: string, email: string): Promise<any> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: '4242424242424242',
          exp_month: 8,
          exp_year: 2023,
          cvc: '314',
        },
      });

      await this.stripe.customers.create({
        email: email,
        id: userId,
        //   source: req.body.stripeToken,
        payment_method: paymentMethod.id,
      });

      const charge = await this.stripe.charges.create({
        amount: '50',
        description: 'Feed payment',
        currency: 'usd',
        source: 'tok_visa',
      });

      const user = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { type: 'paid' } },
      );
      // sessionStorage.setItem('user-type', user.type);
      return {
        success: true,
        message: 'Payment successful',
        charge,
      };
    } catch (err) {
      return err;
    }
  }
}

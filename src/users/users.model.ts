import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: {
    type: Array,
  },
  following: {
    type: Array,
  },
  type: {
    type: String,
    default: 'unpaid',
  },
});

export interface User {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  followers: string[];
  following: string[];
  type: string;
}

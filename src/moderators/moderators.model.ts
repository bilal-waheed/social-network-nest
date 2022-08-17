import mongoose from 'mongoose';

export const ModeratorSchema = new mongoose.Schema({
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
});

export interface Moderator {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

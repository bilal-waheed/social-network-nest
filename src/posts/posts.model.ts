import mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date(),
  },
  createdBy: {
    type: String,
    required: true,
  },
  lastUpdated: {
    type: Date,
  },
});

export interface Post {
  title: string;
  content: string;
  dateCreated: string;
  lastUpdated: string;
  createdBy: string;
}

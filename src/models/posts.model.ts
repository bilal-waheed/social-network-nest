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

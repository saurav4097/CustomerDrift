import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstagramComment extends Document {
  userId: string;
  instagramUserId: string;

  postId: string;
  commentId: string;

  username: string;
  comment: string;

  commentCreatedAt?: Date;
  syncedAt: Date;
}

const InstagramCommentSchema = new Schema<IInstagramComment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    instagramUserId: {
      type: String,
      required: true,
      index: true,
    },

    postId: {
      type: String,
      required: true,
      index: true,
    },

    commentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      default: "",
    },

    comment: {
      type: String,
      default: "",
    },

    commentCreatedAt: {
      type: Date,
    },

    syncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const InstagramComment: Model<IInstagramComment> =
  mongoose.models.InstagramComment ||
  mongoose.model<IInstagramComment>(
    "InstagramComment",
    InstagramCommentSchema
  );

export default InstagramComment;
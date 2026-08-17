import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstagramSetup extends Document {
  userId: string;
  instagramUserId: string;
  instagramUsername: string;
  accessToken: string;
  connectedAt: Date;
  updatedAt: Date;
}

const InstagramSetupSchema = new Schema<IInstagramSetup>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    instagramUserId: {
      type: String,
      required: true,
      index: true,
    },

    instagramUsername: {
      type: String,
      required: true,
    },

    accessToken: {
      type: String,
      required: true,
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const InstagramSetup: Model<IInstagramSetup> =
  mongoose.models.InstagramSetup ||
  mongoose.model<IInstagramSetup>(
    "InstagramSetup",
    InstagramSetupSchema
  );

export default InstagramSetup;
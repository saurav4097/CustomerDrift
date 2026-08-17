import mongoose, { Schema, models, model } from "mongoose";

const ReviewSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    competitorBrand: {
      type: String,
      required: true,
    },

    reviewerName: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewText: {
      type: String,
      default: "",
    },

    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: "neutral",
    },

    source: {
      type: String,
      default: "trustpilot",
    },
  },
  {
    timestamps: true,
  }
);

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
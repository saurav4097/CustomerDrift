import mongoose, { Schema, models, model } from "mongoose";

const CompetitorSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    competitorBrand: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Competitor =
  models.Competitor || model("Competitor", CompetitorSchema);

export default Competitor;
import Mongoose from "mongoose";

const { Schema } = Mongoose;

const reviewSchema = new Schema({
  review: String,
	reviewDate: String,
  reviewer: String,
  rating: Number,
  poiid: {
    type: Schema.Types.ObjectId,
    ref: "Poi",
  },
});

export const Review = Mongoose.model("Review", reviewSchema);
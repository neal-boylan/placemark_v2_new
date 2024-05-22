import Mongoose from "mongoose";

const { Schema } = Mongoose;

const poiSchema = new Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  description: String,
  publicPoi: Boolean,
  averageRating: Number,
  ratingCounter: Number,
  categoryid: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
});

export const Poi = Mongoose.model("Poi", poiSchema);
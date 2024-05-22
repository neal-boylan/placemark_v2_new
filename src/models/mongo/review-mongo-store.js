import { Review } from "./review.js";

export const reviewMongoStore = {
	async getAllReviews() {
    const reviews = await Review.find().lean();
    return reviews;
  },

  async addReview(poiId, review) {
    review.poiid = poiId;
    const newReview = new Review(review);
    const reviewObj = await newReview.save();
    return this.getReviewById(reviewObj._id);
  },

	async getReviewById(id) {
    if (id) {
      const review = await Review.findOne({ _id: id }).lean();
      return review;
    }
    return null;
  },

	async getReviewsByPoiId(id) {
    const reviews = await Review.find({ poiid: id }).lean();
    return reviews;
  },
};
import { Poi } from "./poi.js";
import { reviewMongoStore } from "./review-mongo-store.js";

export const poiMongoStore = {
	async getAllPois() {
    const pois = await Poi.find().lean();
    return pois;
  },

  async getPublicPois() {
    const pois = await Poi.find({ publicPoi: true }).lean();
    return pois;
  },

  async addPoi(categoryId, poi) {
    poi.categoryid = categoryId;
    const newPoi = new Poi(poi);
    const poiObj = await newPoi.save();
    return this.getPoiById(poiObj._id);
  },

  async getPoisByCategoryId(id) {
    const pois = await Poi.find({ categoryid: id }).lean();
    return pois;
  },

	async getPoiById(id) {
    if (id) {
      const poi = await Poi.findOne({ _id: id }).lean();
      return poi;
    }
    return null;
  },

  async deletePoi(id) {
    try {
      await Poi.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAllPois() {
    await Poi.deleteMany({});
  },

  async updatePoi(poi, updatedPoi) {
    const poiDoc = await Poi.findOne({ _id: poi._id });
    poiDoc.name = updatedPoi.name;
    poiDoc.latitude = updatedPoi.latitude;
    poiDoc.longitude = updatedPoi.longitude;
    poiDoc.description = updatedPoi.description;
    poiDoc.ratingCounter = updatedPoi.ratingCounter;
    poiDoc.averageRating = updatedPoi.averageRating;
    await poiDoc.save();
  },

  async makePublicPoi(poi, updatedPoi) {
    console.log("makePublicPoi _id: " + poi._id);
    const poiDoc = await Poi.findOne({ _id: poi._id });
    poiDoc.publicPoi = updatedPoi.publicPoi;
    await poiDoc.save();
  },
};
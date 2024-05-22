import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const poiJsonStore = {
  async getAllPois() {
    await db.read();
    return db.data.pois;
  },

  async addPoi(categoryId, poi) {
    await db.read();
    poi._id = v4();
    poi.categoryid = categoryId;
    db.data.pois.push(poi);
    await db.write();
    return poi;
  },

  async getPoisByCategoryId(id) {
    await db.read();
    let foundPois = db.data.pois.filter((poi) => poi.categoryid === id);
    if (!foundPois) {
      foundPois = null;
    }
    return foundPois;
  },

  async getPoiById(id) {
    await db.read();
    let foundPoi = db.data.pois.find((poi) => poi._id === id);
    if (!foundPoi) {
      foundPoi = null;
    }
    return foundPoi;
  },

  async deletePoi(id) {
    await db.read();
    const index = db.data.pois.findIndex((poi) => poi._id === id);
    if (index !== -1) db.data.pois.splice(index, 1);
    await db.write();
  },

  async deleteAllPois() {
    db.data.pois = [];
    await db.write();
  },

  async updatePoi(poi, updatedPoi) {
    poi.name = updatedPoi.name;
    poi.latitude = updatedPoi.latitude;
    poi.longitude = updatedPoi.longitude;
    await db.write();
  },
};
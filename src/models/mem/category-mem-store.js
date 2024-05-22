import { v4 } from "uuid";
import { poiMemStore } from "./poi-mem-store.js";

let categories = [];

export const categoryMemStore = {
  async getAllCategories() {
    return categories;
  },

  async addCategory(category) {
    category._id = v4();
    categories.push(category);
    return category;
  },

  async getUserCategories(userid) {
    return categories.filter((category) => category.userid === userid);
  },

  async getCategoryById(id) {
    let list = categories.find((category) => category._id === id);
    if (list) {
      list.pois = await poiMemStore.getPoisByCategoryId(list._id);
    } else {
      list = null;
    }
    return list;
  },

  async deleteCategoryById(id) {
    const index = categories.findIndex((category) => category._id === id);
    if (index !== -1) categories.splice(index, 1);
  },

  async deleteAllCategories() {
    categories = [];
  },
};
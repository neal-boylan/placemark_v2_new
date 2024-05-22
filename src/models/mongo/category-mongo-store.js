import { Category } from "./category.js";
import { poiMongoStore } from "./poi-mongo-store.js";

export const categoryMongoStore = {
  async getAllCategories() {
    const categories = await Category.find().lean();
    return categories;
  },
  
  async getCategoryById(id) {
    if (id) {
      const category = await Category.findOne({ _id: id }).lean();
      if (category) {
        category.pois = await poiMongoStore.getPoisByCategoryId(category._id);
      }
      return category;
    }
    return null;
  },

  async getCategoryByTitle(title) {
    if (title) {
      const category = await Category.findOne({ title: title }).lean();
      if (category) {
        category.pois = await poiMongoStore.getPoisByCategoryId(category._id);
      }
      return category;
    }
    return null;
  },

  async addCategory(category) {
    const newCategory = new Category(category);
    const categoryObj = await newCategory.save();
    return this.getCategoryById(categoryObj._id);
  },

  async getUserCategories(id) {
    const category = await Category.find({ userid: id }).lean();
    return category;
  },

  async checkUserCategories(id, categoryTitle) {
    const categories = await Category.find({ userid: id }).lean();
    const category = await Category.findOne({$and:[{ userid: id },{title: categoryTitle}]});
    if (category) {
      return category;
    }
    return null;
  },

  async deleteCategoryById(id) {
    try {
      await Category.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAllCategories() {
    await Category.deleteMany({'title': {$ne : "Public"}});
  },

  async updateCategory(updatedCategory) {
    const category = await Category.findOne({ _id: updatedCategory._id });
    category.title = updatedCategory.title;
    category.img = updatedCategory.img;
    await category.save();
  },

  async updateCategoryTitle(category, updatedCategory) {
    const categoryDoc = await Category.findOne({ _id: category._id });
    categoryDoc.title = updatedCategory.title;
    await categoryDoc.save();
  },
};
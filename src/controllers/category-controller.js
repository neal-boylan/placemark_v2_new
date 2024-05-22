import { db } from "../models/db.js";
import { PoiSpec, CategorySpec } from "../models/joi-schemas.js";
import { imageStore } from "../models/image-store.js";
import validator from "validator";

export const categoryController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const viewData = {
        user: loggedInUser,
        title: "Category",
        category: category,
      };
      return h.view("category-view", viewData);
    },
  },

  publicIndex: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const publicPois = await db.poiStore.getAllPois();
      const viewData = {
        user: loggedInUser,
        title: "Public",
        category: category,
        pois: publicPois
      };
      return h.view("public-category-view", viewData);
    },
  },

  addPoi: {
    validate: {
      payload: PoiSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const currentCategory = await db.categoryStore.getCategoryById(request.params.id);
        return h.view("category-view", { title: "Add PoI error", category: currentCategory, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const newPoi = {
        name: validator.trim(validator.escape(request.payload.name)),
        latitude: Number(request.payload.latitude),
        longitude: Number(request.payload.longitude),
        description: validator.trim(validator.escape(request.payload.description)),
        publicPoi: "false", 
        averageRating: 0,
        ratingCounter: 0,
      };

      await db.poiStore.addPoi(category._id, newPoi);
      return h.redirect(`/category/${category._id}`);
    },
  },

  deletePoi: {
    handler: async function(request, h) {
      const category = await db.categoryStore.getCategoryById(request.params.id);
      await db.poiStore.deletePoi(request.params.poiid);
      return h.redirect(`/category/${category._id}`);
    },
  },

  uploadImage: {
    handler: async function (request, h) {
      try {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        const file = request.payload.imagefile;
        if (Object.keys(file).length > 0) {
          const url = await imageStore.uploadImage(request.payload.imagefile);
          category.img = url;
          await db.categoryStore.updateCategory(category);
        }
        return h.redirect(`/category/${category._id}`);
      } catch (err) {
        console.log(err);
        return h.redirect(`/category/${category._id}`);
      }
    },
    payload: {
      multipart: true,
      output: "data",
      maxBytes: 209715200,
      parse: true,
    },
  },

  editCategory: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const viewData = {
        title: "Edit Category",
        category: category,
        user: loggedInUser,
      };
      return h.view("edit-category-view", viewData);
    },
  },

  updateCategory: {
    validate: {
      payload: CategorySpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const category = await db.categoryStore.getCategoryById(request.params.id);
        return h.view("edit-category-view", { title: "Edit Category error", category: category, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const newCategory = {
        title: validator.trim(validator.escape(request.payload.title)),
      };
      await db.categoryStore.updateCategoryTitle(category, newCategory);
      return h.redirect("/dashboard");
    },
  },
};
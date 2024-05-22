import { db } from "../models/db.js";
import { PoiSpec } from "../models/joi-schemas.js";
import validator from "validator";

export const poiController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const poi = await db.poiStore.getPoiById(request.params.poiid);
      const reviews = await db.reviewStore.getReviewsByPoiId(request.params.poiid);
      const viewData = {
        user: loggedInUser,
        title: poi.name,
        category: category,
        poi: poi,
        reviews: reviews,
      };
      return h.view("poi-view", viewData);
    },
  },

  publicIndex: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const poi = await db.poiStore.getPoiById(request.params.poiid);
      const reviews = await db.reviewStore.getReviewsByPoiId(request.params.poiid);
      const viewData = {
        user: loggedInUser,
        title: poi.name,
        category: category,
        poi: poi,
        reviews: reviews,
      };
      return h.view("public-poi-view", viewData);
    },
  },

  editPoi: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const poi = await db.poiStore.getPoiById(request.params.poiid);
      const viewData = {
        title: "Edit PoI",
        category: category,
        poi: poi,
        user: loggedInUser,
      };
      return h.view("edit-poi-view", viewData);
    },
  },

  updatePoi: {
    validate: {
      payload: PoiSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const poi = await db.poiStore.getPoiById(request.params.poiid);
      return h.view("poi-view", { title: "Edit poi error", category: category, poi: poi, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const poi = await db.poiStore.getPoiById(request.params.poiid);
      console.log(`publicPoi: ${request.payload.publicPoi}`);
      const newPoi = {
        // name: request.payload.name,
        name: validator.trim(validator.escape(request.payload.name)),
        latitude: Number(request.payload.latitude),
        longitude: Number(request.payload.longitude),
        // description: request.payload.description,
        description: validator.trim(validator.escape(request.payload.description)),
        publicPoi: request.payload.publicPoi,
      };
      await db.poiStore.updatePoi(poi, newPoi);
      return h.redirect(`/category/${request.params.id}`);
    },
  },

  publicPoi: {
    validate: {
      payload: PoiSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
      const category = await db.categoryStore.getCategoryById(request.params.id);
      const poi = await db.poiStore.getPoiById(request.params.poiid);
      return h.view("poi-view", { title: "Edit poi error", category: category, poi: poi, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const category = await db.categoryStore.getCategoryByTitle("Public");
      const poi = await db.poiStore.getPoiById(request.params.id);
      console.log("publicPoi: " + poi.publicPoi);
      const newPoi = {
        name: poi.name,
        latitude: poi.latitude,
        longitude: poi.longitude,
        description: poi.description,
        publicPoi: !poi.publicPoi,
      };
      
      if(poi.publicPoi){
        await db.poiStore.addPoi(category._id, newPoi);
      } else {
        await db.poiStore.deletePoi(category._id, newPoi);
      }
      await db.poiStore.makePublicPoi(poi, newPoi);
      console.log("publicPoi: " + poi.publicPoi);
      return h.redirect(`/category/${request.params.categoryid}`);
      // return h.redirect("/dashboard");
    },
  },

  addReview: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const category = await db.categoryStore.getCategoryById(request.params.categoryid);
      const poi = await db.poiStore.getPoiById(request.params.id);
      const d = new Date();
      const newReview = {
        // review: request.payload.review,
        review: validator.trim(validator.escape(request.payload.review)),
        reviewDate: d.toString(),
        reviewer: loggedInUser.firstName,
        rating: request.payload.rating,
      };

      poi.averageRating = ((Number(poi.averageRating) * Number(poi.ratingCounter)) + Number(request.payload.rating))/(Number(poi.ratingCounter)+1);
      poi.ratingCounter += 1;
      const newPoi = {
        name: poi.name,
        latitude: poi.latitude,
        longitude: poi.longitude,
        description: poi.description,
        publicPoi: poi.publicPoi,
        ratingCounter: poi.ratingCounter,
        averageRating: poi.averageRating
      };
      await db.poiStore.updatePoi(poi, newPoi);
      await db.reviewStore.addReview(poi._id, newReview);
      if (category.title == "Public") {
        return h.redirect(`/poi/${category._id}/viewpublicpoi/${poi._id}`);
      } else {
        return h.redirect(`/poi/${category._id}/viewpoi/${poi._id}`);
      }
    },
  },

  sharePoiIndex: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const users = await db.userStore.getAllUsers();
      const poi = await db.poiStore.getPoiById(request.params.id);
      const viewData = {
        title: "Share PoI",
				users: users,
        poi: poi
      };
      return h.view("share-view", viewData);
    },
  },

  sharePoi: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const user = await db.userStore.getUserById(request.params.userid);
      const poi = await db.poiStore.getPoiById(request.params.id);
      const category = await db.categoryStore.getCategoryById(poi.categoryid);
      const categoryName = await db.categoryStore.getCategoryByTitle(category.title)
      const categories = await db.categoryStore.getUserCategories(user._id);

      // Check if usser to share with already has a category for PoI to be shared
      const result = await db.categoryStore.checkUserCategories(user._id, category.title);
      console.log("Result: " + result);
      let newPoi = {
        name: poi.name,
        latitude: poi.latitude,
        longitude: poi.longitude,
        description: poi.description,
        publicPoi: "false"
      }

      // If User to share with doesn't have a category for PoI, create category
      if (result == null){
        let newCategory = {
          userid: user._id,
          title: category.title,
        };
        
        newCategory = await db.categoryStore.addCategory(newCategory);
        await db.poiStore.addPoi(newCategory._id, newPoi);
        } else{
          await db.poiStore.addPoi(result._id, newPoi);   
        }
      return h.redirect("/dashboard");
    },
  },
};
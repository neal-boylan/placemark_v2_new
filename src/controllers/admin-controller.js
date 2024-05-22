import { db } from "../models/db.js";
import { UserSpec, CategorySpec, PoiSpec } from "../models/joi-schemas.js";

export const adminController = {
  index: {
    auth: false,
    handler: async function (request, h) {
			const users = await db.userStore.getAllUsers();
      const viewData = {
        title: "Placemark Admin",
				users: users
      };
      return h.view("admin-view", viewData);
    },
  },

	deleteUsers: {
    auth: false,
    handler: async function (request, h) {
      await db.userStore.deleteAll();
      return h.redirect("/admin");
    },
  },

	deleteOneUser: {
    auth: false,
    handler: async function (request, h) {
      const user = await db.userStore.getUserById(request.params.id);
      await db.userStore.deleteUserById(user._id);
      return h.redirect("/admin");
    },
  },

	deleteCategories: {
    auth: false,
    handler: async function (request, h) {
      await db.categoryStore.deleteAllCategories();
      return h.redirect("/admin");
    },
  },

	deletePois: {
    auth: false,
    handler: async function (request, h) {
      await db.poiStore.deleteAllPois();
      return h.redirect("/admin");
    },
  },
};
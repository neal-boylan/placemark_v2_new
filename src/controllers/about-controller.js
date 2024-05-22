export const aboutController = {
  index: {
    handler: function (request, h) {
      const loggedInUser = request.auth.credentials;
      const viewData = {
        user: loggedInUser,
        title: "About Playtime",
      };
      return h.view("about-view", viewData);
    },
  },
};
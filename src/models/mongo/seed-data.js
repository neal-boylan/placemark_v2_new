export const seedData = {
  users: {
    _model: "User",
    homer: {
      firstName: "Homer",
      lastName: "Simpson",
      email: "homer@simpson.com",
      password: "secret"  
    },
    marge: {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: "secret"
    },
    bart: {
      firstName: "Bart",
      lastName: "Simpson",
      email: "bart@simpson.com",
      password: "secret"
    }
  },
	categories: {
    _model: "Category",
    pubs: {
      title: "Pubs",
      userid: "->users.homer"
    },
    public: {
      title: "Public",
    }
  },
  pois: {
    _model : "Poi",
    poi_1 : {
      name: "Moe's",
      latitude: 11,
      longitude: 15,
      description: "Nice place.",
      public: false,
      categoryid: "->categories.pubs"
    },
  },
  reviews: {
    _model : "Review",
    review_1 : {
      review: "Great Duff",
      reviewDate: "11/11/11",
      reviewer: "Homer",
      poiid: "->pois.Moe's"
    },
  }
};
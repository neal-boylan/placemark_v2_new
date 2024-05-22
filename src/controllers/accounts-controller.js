import { db } from "../models/db.js";
import { UserSpec, UserCredentialsSpec } from "../models/joi-schemas.js";
import bcrypt from "bcrypt";
import validator from "validator";

export const accountsController = {
  index: {
    auth: false,
    handler: function (request, h) {
      return h.view("main", { title: "Welcome to Playlist" });
    },
  },

  showSignup: {
    auth: false,
    handler: function (request, h) {
      return h.view("signup-view", { title: "Sign up for Playlist" });
    },
  },

  signup: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("signup-view", { title: "Sign up error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      // const validator = require('validator');
      const user = request.payload;

      user.firstName = validator.trim(validator.escape(user.firstName));
      user.lastName = validator.trim(validator.escape(user.lastName));
      user.email = validator.trim(validator.escape(user.email));

      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            // Handle error
            return;
        }
        // Salt generation successful, proceed to hash the password
        const userPassword = user.password;
        bcrypt.hash(userPassword, salt, (err, hash) => {
            if (err) {
                // Handle error
                return;
            }
            // Hashing successful, 'hash' contains the hashed password
            user.password = hash;
            db.userStore.addUser(user);
        });
      });

      return h.redirect("/login");
    },
  },

  showLogin: {
    auth: false,
    handler: function (request, h) {
      return h.view("login-view", { title: "Login to Playlist" });
    },
  },

  login: {
    auth: false,
    validate: {
      payload: UserCredentialsSpec,
      options: { abortEarly: false },
      failAction: function (request, h, error) {
        return h.view("login-view", { title: "Log in error", errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const { email, password } = request.payload;
      if (email === "admin@placemark.com" && password === "admin") {
        return h.redirect("/admin");
      }
      const user = await db.userStore.getUserByEmail(email);
      const test = await bcrypt.compare(password, user.password);

      if (!user || test !== true) {
        const message = "Incorrect Username/Password";
        return h.view("login-view", { title: "Incorrect Username/Password", errors: message });
      }

      request.cookieAuth.set({ id: user._id });
      return h.redirect("/dashboard");
    },
  },
  
  logout: {
    handler: function (request, h) {
      request.cookieAuth.clear();
      return h.redirect("/");
    },
  },

  async validate(request, session) {
    const user = await db.userStore.getUserById(session.id);
    if (!user) {
      return { isValid: false };
    }
    return {isValid: true, credentials: user };
  },

  editUser: {
    handler: async function (request, h) {
      const user = await db.userStore.getUserById(request.params.id);
      const viewData = {
        title: "Edit User",
        user: user,
      };
      return h.view("account-view", viewData);
    },
  },
  
  updateUser: {
    auth: false,
    validate: {
      payload: UserSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const user = await db.userStore.getUserById(request.params.id);
        return h.view("account-view", { title: "Account Update error", user: user, errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const user = await db.userStore.getUserById(request.params.id);

      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            // Handle error
            return;
        }
        // Salt generation successful, proceed to hash the password
        const userPassword = request.payload.password;
        bcrypt.hash(userPassword, salt, (err, hash) => {
            if (err) {
                // Handle error
                return;
            }
            // Hashing successful, 'hash' contains the hashed password
            const newUser = {
              firstName: validator.trim(validator.escape(user.request.payload.firstName)),
              lastName: validator.trim(validator.escape(user.request.payload.lastName)),
              email: validator.trim(validator.escape(user.request.payload.email)),
              password: hash,
            };

            db.userStore.updateUser(user, newUser);
        });
      });
      // await db.userStore.updateUser(user, newUser);
      return h.redirect("/dashboard");
    },
  },

  deleteUser: {
    handler: async function (request, h) {
      const user = await db.userStore.getUserById(request.params.id);
      await db.userStore.deleteUserById(user._id);
      return h.redirect("/");
    },
  },
};
import usersStorage from "../storages/usersStorage.js";
import { body, validationResult, matchedData, query, oneOf } from "express-validator";

export const usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

export const usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

export const usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render("updateUser", {
    title: "Update user",
    user: user,
  });
};

export const usersSearchBoxGet = (req, res) => {
  res.render("searchBox", {
    title: "Search user",
  });
};


// validation error messages
const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const emailErr = "must be a valid email address."
const ageErr = "must be a number between 18 and 120."
const bioErr  = "must be maximum 200 characters."
const queryErr = "must contain full name or email."

// input validation methods
const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
  body("email").trim()
    .isEmail().withMessage(`Email ${emailErr}`),
  body("age").trim()
    .optional({ values: "falsy" })
    .isInt({ min: 18, max: 120}).withMessage(`Age ${ageErr}`),
  body("bio").trim()
    .optional({ values: "falsy" })
    .isLength({ max: 120 }).withMessage(`Bio ${bioErr}`),
];

const validateQueryName = [
  query("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  query("lastName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
]

const validateQueryEmail = [
  query("email").trim()
    .isEmail().withMessage(`Email ${emailErr}`),
]

const validateQuery = oneOf(
  [ 
    validateQueryName, 
    validateQueryEmail 
  ], 
  {
    message: `Your query ${queryErr}`,
  }
);

// We can pass an entire array of middleware validations to our controller.
export const usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = matchedData(req);
    usersStorage.addUser({ firstName, lastName, email, age, bio });
    res.redirect("/");
  }
];

export const usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = matchedData(req);
    usersStorage.updateUser(req.params.id, { firstName, lastName, email, age, bio });
    res.redirect("/");
  }
];

export const usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

export const usersSearchGet = [
  validateQuery, 
  (req, res) => {
    const users = usersStorage.getUsers();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("searchBox", {
        title: "Search user",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email} = matchedData(req);
    let user;
    if (!firstName || !lastName) {
      user = users.find((e) => e.email === email);
    } else {
      user = users.find((e) => e.firstName === firstName && e.lastName === lastName);
    }

    res.render("search", {
      title: "Search result: ",
      user: user,
    });
  }
];
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

//validators
function validateDataExists(req, res, next) {
  if (req.body.data) {
    next();
  } else {
    next({
      status: 400,
      message: "Please include a data object in your request body.",
    });
  }
}

function createValidatorFor(field) {
  return function (req, res, next) {
    if (req.body.data[field]) {
      next();
    } else {
      next({
        status: 400,
        message: `Please include ${field}`,
      });
    }
  };
}

function createValidatorForPrice(field) {
  return function (req, res, next) {
    if (
      req.body.data[field] &&
      req.body.data[field] > 0 &&
      typeof req.body.data[field] == "number"
    ) {
      next();
    } else {
      next({
        status: 400,
        message: `Please include ${field} in the request data`,
      });
    }
  };
}

function validateDishExists(req, res, next) {
  let { dishesId } = req.params;
  console.log(dishesId);
  let index = dishes.findIndex((d) => d.id === dishesId);
  if (index > -1) {
    let dish = dishes[index];
    // save the dinosaur that we found for future use
    res.locals.dish = dish;
    res.locals.index = index;
    next();
  } else {
    return next({
      status: 404,
      message: `Dish does not exist: ${req.params.dishesId}`,
    });
  }
}

//create
function create(req, res, next) {
  const { name, description, price, image_url } = req.body.data;
  let newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  //   nextId+=1;
  dishes.push(newDish);
  res.status(201).send({ data: newDish });
}

//read
// function read(req, res, next) {
//   // use the saved dinosaur from inside the validator function
//   const { dish } = res.locals;
//   res.send({ data: dish });
// }
//update
function update(req, res, next) {
  let { dishesId } = req.params;
  const paste = res.locals.dish;
  const { data: { id, name, description, price, image_url } = {} } = req.body;

  ////////////////////////// // Update the paste
  paste.id = id;
  paste.name = name;
  paste.description = description;
  paste.price = price;
  paste.image_url = image_url;
  if (paste.id == null || paste.id == undefined || paste.id.length == 0) {
    res.json({ data: paste });
  }

  if (paste.id !== dishesId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishesId}`,
    });
  } else {
    res.json({ data: paste });
  }
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}
//list
function list(req, res, next) {
  res.send({ data: dishes });
}

let fields = ["name", "description", "price", "image_url"];

module.exports = {
  list,
  create: [
    validateDataExists,
    createValidatorFor("name"),
    createValidatorFor("description"),
    createValidatorForPrice("price"),
    createValidatorFor("image_url"),
    create,
  ],
  // create: [validateDataExists, ...fields.map(createValidatorFor), create],
  read: [validateDishExists, read],
  update: [
    validateDishExists,
    validateDataExists,
    createValidatorFor("name"),
    createValidatorFor("description"),
    createValidatorForPrice("price"),
    createValidatorFor("image_url"),
    update,
  ],
};

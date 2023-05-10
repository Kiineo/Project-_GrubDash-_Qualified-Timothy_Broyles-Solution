const path = require("path");

// Use the existing dishes data
const orders = require(path.resolve("src/data/orders-data"));

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

function destroy(req, res, next) {
  // find the dinosaur to destroy
  const { ordersId } = req.params;
  // splice it out of the array
  const toDestroy = orders.findIndex((order) => order.id === ordersId);
  orders.splice(toDestroy, 1);
  // send back a 204
  res.status(204).send();
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
    if (req.body.data[field] && req.body.data[field] > 0) {
      next();
    } else {
      console.log(field, req.body.data[field]);
      next({
        status: 400,
        message: `Please include ${field} in the request data`,
      });
    }
  };
}

function createValidatorForDishes(field) {
  return function (req, res, next) {
    if (
      req.body.data.dishes &&
      Array.isArray(req.body.data.dishes) &&
      req.body.data.dishes.length > 0
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

function quantityIsValid(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  for (let i = 0; i < dishes.length; i++) {
    let quantity = dishes[i].quantity;
    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  next();
}

function validateUpdatedId(req, res, next) {
  const orderId = res.locals.order.id;
  const { data: { id } = {} } = req.body;
  if (!id || orderId == id) {
    next();
  } else {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id} Route:${orderId}`,
    });
  }
}

function validateStatusPending(req, res, next) {
  let { status } = res.locals.order;
  if (status != "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  } else {
    next();
  }
}

function validateDishExists(req, res, next) {
  let { ordersId } = req.params;
  let index = orders.findIndex((d) => d.id === req.params.ordersId);
  if (index > -1) {
    let order = orders[index];
    // save the dinosaur that we found for future use
    res.locals.order = order;
    res.locals.index = index;
    next();
  } else {
    next({
      status: 404,
      message: `could not find id ${ordersId}`,
    });
  }
}

function validateStatus(req, res, next) {
  let {
    data: { status },
  } = req.body;
  if (status.length == 0 || status === undefined || status == "invalid") {
    next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  }
  if (status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else {
    next();
  }
}

//create
function create(req, res, next) {
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;
  let newDish = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newDish);
  res.status(201).send({ data: newDish });
}

//read
function read(req, res, next) {
  // use the saved dinosaur from inside the validator function
  const { dish } = res.locals;
  res.send({ data: dish });
}
//update
function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

  ////////////////////////// // Update the order

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.dishes = dishes;

  res.json({ data: order });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}
//list
function list(req, res, next) {
  res.send({ data: orders });
}

let fields = ["mobileNumber", "deliverTo", "status", "dishes"];

module.exports = {
  list,
  create: [
    validateDataExists,
    createValidatorFor("mobileNumber"),
    createValidatorFor("deliverTo"),
    createValidatorForDishes("dishes"),
    quantityIsValid,
    create,
  ],
  read: [validateDishExists, read],
  update: [
    validateDishExists,
    validateUpdatedId,
    createValidatorFor("mobileNumber"),
    createValidatorFor("deliverTo"),
    createValidatorForDishes("dishes"),
    createValidatorFor("status"),
    quantityIsValid,
    validateStatus,
    update,
  ],
  delete: [validateDishExists, validateStatusPending, destroy],
};

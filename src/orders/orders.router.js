const router = require("express").Router();

// TODO: Implement the /orders routes needed to make the tests pass
const express = require('express');
const ordersRouter = express.Router({ mergeParams: true });
const controller = require('./orders.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');
// TODO: Implement the /dishes routes needed to make the tests pass

ordersRouter.route('/')
  .get(controller.list)
  .post(controller.create)
  .put(controller.update)
  .all(methodNotAllowed);

  ordersRouter.route('/:ordersId')
  .get(controller.read)

  .put(controller.update)
  .all(methodNotAllowed);

module.exports = ordersRouter;


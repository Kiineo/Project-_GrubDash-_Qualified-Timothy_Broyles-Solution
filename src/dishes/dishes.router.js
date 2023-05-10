const express = require('express');
// const router = require("express").Router();


const dishesRouter = express.Router({ mergeParams: true });
const controller = require('./dishes.controller');
const methodNotAllowed = require('../errors/methodNotAllowed');
// TODO: Implement the /dishes routes needed to make the tests pass

dishesRouter.route('/')
  .get(controller.list)
  .post(controller.create)
  .put(controller.update)
  .all(methodNotAllowed);

dishesRouter.route('/:dishesId')
  .get(controller.read)
  .delete(controller.destroy)
  .put(controller.update)
  .all(methodNotAllowed);

module.exports = dishesRouter;


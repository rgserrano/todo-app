const express = require('express');
const router = express.Router();
const { body, validationResult } = require("express-validator");

const nextVal = require("../lib/nextVal");
const findTodo = (id, todos) => todos.find(todo => todo.id === +id);
const dateValidator = (date) => {
  let isEmpty = date === "";
  let isValidDay = !isNaN(Number(date));
  return isEmpty || isValidDay;
}

router.get("/todos", (req, res, next) => {
  res.json(req.session.todos);
});

router.post("/todos", [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 }),
  body('day')
    .custom(dateValidator),
  body('month')
    .custom(dateValidator),
  body('year')
    .custom(dateValidator)
  ],
  (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).send("Cannot add todo");
    } else {
      let newTodo = { id: nextVal(), completed: false };
      Object.assign(newTodo, req.body);
      
      req.session.todos.push(newTodo);
      res.status(200).json(newTodo);
    }
});

router.delete("/todos/:id", (req, res, next) => {
  let todo = findTodo(req.params.id, req.session.todos);

  if (!todo) {
    res.status(404).send("Not Found.");
  } else {
    req.session.todos.splice(req.session.todos.indexOf(todo), 1);
    res.sendStatus(204);
  }
});

router.put("/todos/:id", [], (req, res, next) => {
  let todo = findTodo(req.params.id, req.session.todos);

  if (!todo) {
    res.status(404).send(`Not found`);
  } else {
    Object.assign(todo, req.body);
    res.status(200).json(todo);
  }
});

module.exports = router;

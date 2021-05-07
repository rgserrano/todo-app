const express = require('express');
const apiRouter = require("./routes/api")
const morgan = require('morgan');
const session = require('express-session');
const store = require('connect-loki');

const app = express();
const LokiStore = store(session);

const Todo = require("./lib/todo");

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000,
    path: "/",
    secure: false,
  },
  name: "todos-session-id",
  resave: false,
  saveUninitialized: true,
  // figure out what to do with this
  secret: "hella insecure amirite",
  store: new LokiStore({}),
}));
app.use((req, res, next) => {
  let todos = [];
  if ("todos" in req.session) {
    req.session.todos.forEach(rawTodo => {
      todos.push(new Todo(rawTodo))
    });
  }
  req.session.todos = todos;
  next();
});
app.use("/api", apiRouter);

app.listen("3000", "localhost", () => console.log('listening on port 3000'));

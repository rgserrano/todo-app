import Todo from "./todo_model.js";

export default class TodosManager {
  constructor(rawTodos) {
    this.todos = rawTodos.map(todo => new Todo(todo));
  }

  async add(todo) {
    const options = {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo)
    };

    let res = await fetch("/api/todos", options);
    if (!res.ok) return;

    let rawTodo = await res.json();
    this.todos.push(new Todo(rawTodo));
  }

  async destroy(id) {
    const options = { method: "DELETE" };

    let res = await fetch(`/api/todos/${id}`, options);
    if (!res.ok) return;

    this.todos.splice(this.todos.indexOf(this.findById(id)), 1);
  }

  async edit(id, properties) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(properties)
    };

    let res = await fetch(`/api/todos/${id}`, options);
    if (!res.ok) return;

    let rawTodo = await res.json();
    this.todos.splice(this.todos.indexOf(this.findById(id)), 1, new Todo(rawTodo));
  }

  async toggle(id) {
    await this.edit(id, { completed: !this.findById(id).completed });
  }

  findById(id) {
    return this.todos.find(todo => todo.id === +id);
  }

  allTodos() {
    return this.todos;
  }

  doneTodos() {
    return this.todos.filter(todo => todo.completed);
  }

  todosForDueDate(dueDate, onlyCompleted) {
    let todos = onlyCompleted ? this.doneTodos() : this.allTodos();
    return todos.filter(todo => todo.due_date === dueDate);
  }

  todosByTitle(title, onlyCompleted) {
    const compareTitles = (todoA, todoB) => {
      let titleA = todoA.title.toLowerCase();
      let titleB = todoB.title.toLowerCase();

      if (titleA > titleB) return 1;
      if (titleB > titleA) return -1;
      return 0;
    }

    let todos;
    if (title === "All Todos") {
      todos = this.allTodos();
    } else if (title === "Completed") {
      todos = this.doneTodos();
    } else {
      todos = this.todosForDueDate(title, onlyCompleted);
    }

    let done = todos.filter(todo => todo.completed);
    let undone = todos.filter(todo => !todo.completed);

    done.sort(compareTitles);
    undone.sort(compareTitles);

    return [].concat(undone, done);
  }

  todosByDate(onlyCompleted) {
    const onlyUnique = (value, index, self) => {
      return self.indexOf(value) === index;
    }    
    const compareDates = (dateA, dateB) => {
      let [monthA, yearA] = dateA.split("/");
      let [monthB, yearB] = dateB.split("/");

      if (monthA === "No Due Date") return -1;
      if (monthB === "No Due Date") return 1;
      if (yearA > yearB) return 1;
      if (yearA < yearB) return -1;
      if (monthA > monthB) return 1;
      if (monthA < monthB) return -1;
      return 0;
    };

    let todos = onlyCompleted ? this.doneTodos() : this.allTodos();
    let dates = todos.map(todo => todo.due_date).filter(onlyUnique).sort(compareDates);
    
    return dates.map(dueDate => {
      let matchingTodos = this.todosForDueDate(dueDate, onlyCompleted);
      return {
        "due_date": dueDate,
        "list": matchingTodos,
        "length": matchingTodos.length,
      }
    });
  }
}
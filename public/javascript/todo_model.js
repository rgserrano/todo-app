export default class Todo {
  constructor(rawTodo) {
    this.id = rawTodo.id;
    this.title = rawTodo.title;
    this.completed = rawTodo.completed;
    this.description = rawTodo.description;
    this.day = rawTodo.day;
    this.month = rawTodo.month;
    this.year = rawTodo.year;
    this.due_date = this._formatDueDate();
  }

  _formatDueDate() {
    return (!this.month || !this.year) ? "No Due Date" : `${this.month}/${(this.year).slice(2)}`;
  }
}

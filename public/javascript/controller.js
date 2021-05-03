import Display from "./todos_display.js";
import TodosManager from "./todos_service.js";
import debounce from "./debounce.js";

export default class Controller {
  constructor() {
    this.todosManager;
    this.display = new Display();
  }

  async init() {
    await fetch("/api/todos")
      .then(response => {
        return response.json()
      })
      .then(rawTodos => {
        this.todosManager = new TodosManager(rawTodos);
      })
      .catch(err => console.log('error', err));

    this.updateDisplay();
    this.bindEventHandlers();
    return this;
  }

  async updateDisplay(onlyCompleted = false) {
    let doneTodosLength = this.todosManager.doneTodos().length;
    let doneTodosByDate = this.todosManager.todosByDate(true);
    let allTodosLength = this.todosManager.allTodos().length;
    let allTodosByDate = this.todosManager.todosByDate(false);

    if (onlyCompleted) {
      this.display.renderCompletedSidebarSection(doneTodosLength, doneTodosByDate);
    } else {
      this.display.renderAllSidebarSections(doneTodosLength, doneTodosByDate, allTodosLength, allTodosByDate);
    }
    this.display.renderActiveSidebarList();
    this.display.renderSelectedTodoList(this.getSelectedTodoList());
  }

  bindEventHandlers() {
    this.display.bindToggleTodo(this.handleToggleTodo.bind(this));
    this.display.bindDeleteTodo(this.handleDeleteTodo.bind(this));
    this.display.bindShowEditForm(this.handleShowEditForm.bind(this));
    this.display.bindSubmitForm(debounce(this.handleSubmitForm.bind(this), 3000));
    this.display.bindMarkComplete(debounce(this.handleMarkComplete.bind(this), 5000));
    this.display.bindShowSelectedList(this.handleShowSelectedList.bind(this));
  }

  async handleToggleTodo(id) {
    await this.todosManager.toggle(id);
    this.updateDisplay(true);
  }

  async handleDeleteTodo(id) {
    await this.todosManager.destroy(id);
    this.updateDisplay(false);
  }

  async handleMarkComplete(id) {
    if (!id) {
      alert("Cannot mark as complete as item has not been created yet!");
      return;
    } else {
      await this.todosManager.edit(id, { completed: true });
      this.updateDisplay(true);
    }
  }

  async handleSubmitForm(id) {
    let formValues = this.display.getFormValues();
    let errors = this.validate(formValues);
    
    if (errors) {
      errors.forEach(err => alert(err));
      return;
    } else {
      if (id) {
        await this.todosManager.edit(id, formValues);
        this.updateDisplay();
      } else {
        await this.todosManager.add(formValues);
        this.resetDisplay();
      }
    }

    this.display.hideForm();
  }

  handleShowEditForm(id) {
    let selectedTodo = this.todosManager.findById(id);
    this.display.showForm(selectedTodo);
  }

  validate(formValues) {
    let errors = [];
    if (!formValues.title || formValues.title.length < 3) errors.push('You must enter a title at least 3 characters long.');
    return (errors.length > 0) ? errors : null;
  }

  resetDisplay() {
    this.display.updateSelectedListInfo(document.querySelector("#all_header"));
    this.updateDisplay();
  }

  getSelectedTodoList() {
    let title = this.display.selectedListInfo.title;
    let todos = this.todosManager.todosByTitle(title, this.display.selectedListInfo.completed);
    return {
      title: title,
      todos: todos,
      length: todos.length,
    }
  }

  handleShowSelectedList(list) {
    this.display.updateSelectedListInfo(list);
    this.display.renderSelectedTodoList(this.getSelectedTodoList());
    this.display.renderActiveSidebarList();
    
  }
}

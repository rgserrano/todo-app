export default class Display {
  constructor() {
    this.selectedListInfo = {title: "All Todos", onlyCompleted: false, selector: "#all_header"};
    this._setTemplateReferences();
    this._setDOMReferences();
    this._bindEvents();
  }

  _setTemplateReferences() {
    this.templates = {};
    document.querySelectorAll('[type="text/x-handlebars"]')
      .forEach(template => {
        this.templates[template.id] = Handlebars.compile(template.innerHTML);
        if (template.getAttribute('data-type') === 'partial') {
          Handlebars.registerPartial(template.id, template.innerHTML);
        }
      });
  }

  _setDOMReferences() {
    this.selectedListSection = document.querySelector("#selected_list tbody");
    this.form = document.querySelector("form");
    this.formInputs = {
      title: document.querySelector("#title"),
      day: document.querySelector("#due_day"),
      month: document.querySelector("#due_month"),
      year: document.querySelector("#due_year"),
      description: document.querySelector("#description"),
    };
  }

  _bindEvents() {
    document.querySelector("label[for='new_item']").addEventListener("click", () => this.showForm());
    document.querySelector("#modal_layer").addEventListener("click", () => this.hideForm());
  }

  _getDataId(target) {
    return target.closest('[data-id]').getAttribute('data-id');
  }

  updateSelectedListInfo(list) {
    let title = list.getAttribute("data-title") || "";
    let completed = (list.closest('section.completed')) ? true : false;
    let selector = `${(completed) ? "section.completed " : ""}[data-title="${title}"]`;
    this.selectedListInfo = {title, completed, selector};
  }

  renderAllSidebarSections(doneTodoCount, doneTodosByDate, allTodosLength, allTodosByDate) {
    const renderAllListsInfo = (allTodosLength) => {
      document.querySelector("#all_todos").innerHTML = this.templates["all_todos_template"]({ length: allTodosLength });
    }
    const renderAllLists = (allTodosByDate) => {
      document.querySelector("#all_lists").innerHTML = this.templates["all_list_template"]({ todos_by_date: allTodosByDate });
    }

    this.renderCompletedSidebarSection(doneTodoCount, doneTodosByDate);
    renderAllListsInfo(allTodosLength);
    renderAllLists(allTodosByDate);
  }

  renderCompletedSidebarSection(doneTodosLength, doneTodosByDate) { 
    const renderDoneListsInfo = (doneTodosLength) => {
      document.querySelector("#completed_todos").innerHTML = this.templates["completed_todos_template"]({ length: doneTodosLength });
    }  
    const renderDoneLists = (doneTodosByDate) => {
      document.querySelector("#completed_lists").innerHTML = this.templates["completed_list_template"]({ done_todos_by_date: doneTodosByDate });
    }

    renderDoneListsInfo(doneTodosLength);
    renderDoneLists(doneTodosByDate);
  }

  renderSelectedTodoList(todoList) {
    const renderSelectedListInfo = (todoList) => {
      document.querySelector("#items header").innerHTML = this.templates["title_template"]({ selected: todoList });
    }
    const renderSelectedListItems = (selectedTodos) => {
      this.selectedListSection.innerHTML = this.templates["list_template"]({ selected: selectedTodos });
    }

    renderSelectedListInfo(todoList);
    renderSelectedListItems(todoList.todos);
  }

  renderActiveSidebarList() {
    let activeList = document.querySelector(".active");
    if (activeList) activeList.classList.remove("active");

    let newActiveList = document.querySelector(this.selectedListInfo.selector);
    if (newActiveList) newActiveList.classList.add("active");
  }

  populateForm(todoToEdit) {
    for (let inputName in this.formInputs) {
      if (todoToEdit[inputName]) this.formInputs[inputName].value = todoToEdit[inputName];
    }
  }

  showForm(todoToEdit = undefined) {
    const fadeIn = element => {
      element.classList.remove('hide');
      element.classList.add('vis');
    }

    this.form.reset();
    
    if (todoToEdit) {
      this.form.setAttribute("data-id", todoToEdit.id);
      this.populateForm(todoToEdit);
    }

    fadeIn(this.form.parentElement);
    fadeIn(this.form.parentElement.previousElementSibling);
  }

  hideForm() {
    const fadeOut = element => {
      element.classList.remove('vis');
      element.classList.add('hide');
    }
    this.form.setAttribute("data-id", "");
    fadeOut(this.form.parentElement);
    fadeOut(this.form.parentElement.previousElementSibling);
  }

  getFormValues() {
    let formValues = {};

    for (let inputName in this.formInputs) {     
      let input = this.formInputs[inputName];
      let value = input.value;
      formValues[inputName] = (input.nodeName === 'SELECT' && input.selectedIndex === 0) ? "" : value;
    }
    return formValues;
  }

  bindToggleTodo(handler) {
    let self = this;
    this.selectedListSection.addEventListener("click", async (e) => {
      if (e.target.nodeName !== 'SPAN' && !e.target.classList.contains('list_item')) return;

      e.preventDefault();

      let todoId = self._getDataId(e.target);
      await handler(todoId);
    });
  }

  bindDeleteTodo(handler) {
    let self = this;
    this.selectedListSection.addEventListener("click", async (e) => {
      if (!e.target.closest('td').classList.contains('delete')) return;

      e.preventDefault();
      let todoId = self._getDataId(e.target);
      await handler(todoId);
    });
  }

  bindShowEditForm(handler) {
    let self = this;
    this.selectedListSection.addEventListener("click", (e) => {
      if (e.target.nodeName !== 'LABEL') return;

      e.preventDefault();

      let todoId = self._getDataId(e.target);
      handler(todoId);
    });
  }

  bindSubmitForm(handler) {
    this.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      let todoId = this._getDataId(this.form);
      await handler(todoId);
    });
  }

  bindMarkComplete(handler) {
    document.querySelector("[name='complete']").addEventListener("click", async (e) => {
      e.preventDefault();

      let todoId = this._getDataId(this.form);
      await handler(todoId);

      this.hideForm();
    });
  }

  bindShowSelectedList(handler) {
    document.querySelector("#sidebar").addEventListener("click", async (e) => {
      let list = e.target.closest("[data-title]");
      if (!list) return;

      await handler(list);
    });
  }
}

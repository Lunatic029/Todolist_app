window.addEventListener('load', () => {
    todos = JSON.parse(localStorage.getItem('todos')) || [];
    const nameInput = document.querySelector('#name');
    const newTodoForm = document.querySelector('#new-todo-form');

    const username = localStorage.getItem('username') || '';

    nameInput.value = username;

    nameInput.addEventListener('change', e => {
        localStorage.setItem('username', e.target.value);
    })

    newTodoForm.addEventListener('submit', e => {
        e.preventDefault();

        const todo = {
            content: e.target.elements.content.value,
            category: e.target.elements.category.value,
            done: false,
            createdAt: new Date().getTime()
        }

        todos.push(todo);

        localStorage.setItem('todos', JSON.stringify(todos));

        e.target.reset();

        DisplayTodos();
    })

    DisplayTodos();

    Tick();
    setInterval(Tick, 1000);

})

function Pad(n) {
    return String(n).padStart(2, '0');
}

function FormatClock() {
    const now = new Date();
    return `${Pad(now.getHours())}:${Pad(now.getMinutes())}:${Pad(now.getSeconds())}`;
}

function FormatCountdown(seconds) {
    return `${Pad(Math.floor(seconds / 3600))}:${Pad(Math.floor(seconds % 3600 / 60))}:${Pad(seconds % 60)}`;
}

function Tick() {
    document.querySelector('#clock').textContent = FormatClock();

    let changed = false;

    document.querySelectorAll('.todo-item').forEach(item => {
        if (item.todo.remaining == null) 
            return;

        if (item.todo.remaining > 0) {
            item.todo.remaining--;
            changed = true;
        }

        item.querySelector('.todo-countdown').textContent = FormatCountdown(item.todo.remaining);
    })

    if (changed) localStorage.setItem('todos', JSON.stringify(todos));
}

function DisplayTodos() {
    const todoList = document.querySelector('#todo-list');

    todoList.innerHTML = "";

    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');

        const label = document.createElement('label');
        const input = document.createElement('input');
        const span = document.createElement('span');
        const content = document.createElement('div');
        const actions = document.createElement('div');
        const edit = document.createElement('button');
        const deleteButton = document.createElement('button');
        const countdown = document.createElement('span');
        const hoursInput = document.createElement('input');

        input.type = 'checkbox';
        input.checked = todo.done;
        span.classList.add('bubble');

        if (todo.category == 'emergency') {
            span.classList.add('emergency');
        }else {
            span.classList.add('noemergency');
        }

        content.classList.add('todo-content');
        actions.classList.add('actions');
        edit.classList.add('edit');
        deleteButton.classList.add('delete');
        countdown.classList.add('todo-countdown');
        hoursInput.classList.add('todo-hours');

        content.innerHTML = `<input type="text" value="${todo.content}" readonly>`;
        const contentInput = content.querySelector('input');

        hoursInput.type = 'number';
        hoursInput.placeholder = '小时';

        edit.innerHTML = '编辑';
        deleteButton.innerHTML = '删除';

        if (todo.remaining != null) {
            countdown.textContent = FormatCountdown(todo.remaining);
        }

        content.appendChild(countdown);
        content.appendChild(hoursInput);

        label.appendChild(input);
        label.appendChild(span);
        actions.appendChild(edit);
        actions.appendChild(deleteButton);
        todoItem.appendChild(label);
        todoItem.appendChild(content);
        todoItem.appendChild(actions);

        todoItem.todo = todo;

        todoList.appendChild(todoItem);

        if (todo.done) {
            todoItem.classList.add('done');
        }

        input.addEventListener('click', e => {
            todo.done = e.target.checked;
            localStorage.setItem('todos', JSON.stringify(todos));

            if (todo.done) {
                todoItem.classList.add('done');
            } else {
                todoItem.classList.remove('done');
            }

            DisplayTodos();

        })
        edit.addEventListener('click', e => {
            if (todoItem.classList.contains('editing')) return;

            todoItem.classList.add('editing');
            contentInput.removeAttribute('readonly');
            contentInput.focus();
        })

        todoItem.addEventListener('focusout', e => {
            if (todoItem.contains(e.relatedTarget)) 
                return;

            if (!todoItem.isConnected) 
                return;

            if (!todoItem.classList.contains('editing')) 
                return;

            todoItem.classList.remove('editing');
            contentInput.setAttribute('readonly', true);
            todo.content = contentInput.value;

            const hours = Number(hoursInput.value);
            if (hours > 0) {
                todo.remaining = Math.round(hours * 3600);
            }
            hoursInput.value = '';

            localStorage.setItem('todos', JSON.stringify(todos));
        })

        deleteButton.addEventListener('click', e => {
            todos = todos.filter(t => t != todo);
            localStorage.setItem('todos', JSON.stringify(todos));
            DisplayTodos();
        })
    })
}
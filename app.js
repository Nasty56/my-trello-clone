const userId = localStorage.getItem('myBoardUserId');
if (!userId) window.location.href = 'auth.html';

const modal = document.getElementById('modal');
const taskInput = document.getElementById('taskInput');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const themeBtn = document.getElementById('themeBtn');
const addButtons = document.querySelectorAll('.add-btn');

let tasks = [];
let currentColumn = null;

// Загрузка задач с Java-сервера
async function loadTasks() {
    const res = await fetch(`http://localhost:8080/api/tasks/${userId}`);
    if (res.ok) {
        tasks = await res.json();
        renderBoard();
    }
}

// Сохраняем ОДНУ задачу
async function saveSingleTask(task) {
    await fetch(`http://localhost:8080/api/tasks/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
    });
}

// Удаляем ОДНУ задачу
async function deleteSingleTask(id) {
    await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: 'DELETE'
    });
}

function createTask(text, status) {
    const newTask = {
        id: Date.now().toString(),
        text: text,
        status: status
    };
    tasks.push(newTask);
    saveSingleTask(newTask);
    renderBoard();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    deleteSingleTask(id);
    renderBoard();
}

function renderBoard() {
    const columns = ['ideas', 'todo', 'doing', 'done'];

    columns.forEach(colId => {
        const container = document.getElementById(colId);
        container.innerHTML = '';

        const columnTasks = tasks.filter(task => task.status === colId);
        const countSpan = document.querySelector('.column[data-status="' + colId + '"] .count');
        if (countSpan) countSpan.textContent = columnTasks.length;

        columnTasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'card';
            card.draggable = true;
            card.dataset.id = task.id;

            const text = document.createElement('span');
            text.className = 'card-text';
            text.textContent = task.text;

            const delBtn = document.createElement('button');
            delBtn.className = 'card-del';
            delBtn.textContent = '×';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });

            card.appendChild(text);
            card.appendChild(delBtn);
            container.appendChild(card);
            addDragEvents(card);
        });
    });
}

function openModal(status) {
    currentColumn = status;
    taskInput.value = '';
    modal.classList.remove('hidden');
    taskInput.focus();
}

function closeModal() {
    modal.classList.add('hidden');
    currentColumn = null;
}

addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const status = btn.getAttribute('data-add');
        openModal(status);
    });
});

saveBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text !== '' && currentColumn) {
        createTask(text, currentColumn);
        closeModal();
    }
});

cancelBtn.addEventListener('click', closeModal);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        saveBtn.click();
    }
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

if (themeBtn) {
    if (document.body.classList.contains('dark')) {
        themeBtn.textContent = 'Светлая тема';
    }

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');

        if (isDark) {
            localStorage.setItem('myBoardTheme', 'dark');
            themeBtn.textContent = 'Светлая тема';
        } else {
            localStorage.setItem('myBoardTheme', 'light');
            themeBtn.textContent = 'Тёмная тема';
        }
    });
}

let draggedCard = null;

function addDragEvents(card) {
    card.addEventListener('dragstart', () => {
        draggedCard = card;
        setTimeout(() => {
            card.classList.add('dragging');
        }, 0);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
    });
}

const columnsElements = document.querySelectorAll('.column');

columnsElements.forEach(column => {
    column.addEventListener('dragover', (e) => {
        e.preventDefault();
        column.classList.add('drag-over');
    });

    column.addEventListener('dragleave', () => {
        column.classList.remove('drag-over');
    });

    column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');

        if (draggedCard) {
            const targetStatus = column.getAttribute('data-status');
            const cardId = draggedCard.dataset.id;

            const task = tasks.find(t => t.id === cardId);

            if (task) {
                task.status = targetStatus;
                saveSingleTask(task); // <-- Сохраняем только ту задачу, которую перетащили!
                renderBoard();
            }
        }
    });
});

loadTasks();
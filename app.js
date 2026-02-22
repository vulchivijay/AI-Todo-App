const STORAGE_KEY = 'tasks-v1';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const template = document.getElementById('task-template');
  const status = document.getElementById('status');

  let tasks = load();
  render();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const task = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), text, completed:false };
    tasks.unshift(task);
    save();
    render();
    input.value = '';
    input.focus();
  });

  // Delegate clicks for checkbox toggles and delete
  list.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
      const li = deleteBtn.closest('li');
      const id = li.dataset.id;
      tasks = tasks.filter(t => t.id !== id);
      save();
      render();
      document.getElementById('task-input').focus();
      return;
    }
    const checkbox = e.target.closest('.task-checkbox');
    if (checkbox) {
      const li = checkbox.closest('li');
      const id = li.dataset.id;
      const t = tasks.find(x => x.id === id);
      if (t) t.completed = checkbox.checked;
      save();
      render();
    }
  });

  // Keyboard support: Enter on focused list item toggles checkbox
  list.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const li = e.target.closest('li');
      if (!li) return;
      const cb = li.querySelector('.task-checkbox');
      if (cb) cb.click();
    }
  });

  function load(){
    try{const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []}catch(e){return []}
  }

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function render(){
    list.innerHTML = '';
    if (tasks.length === 0){
      status.textContent = 'No tasks yet. Add one above.';
      return;
    }
    status.textContent = `${tasks.filter(t=>!t.completed).length} remaining • ${tasks.length} total`;
    tasks.forEach(task => {
      const node = template.content.firstElementChild.cloneNode(true);
      const li = node;
      li.dataset.id = task.id;
      const checkbox = li.querySelector('.task-checkbox');
      const label = li.querySelector('.task-label');
      const del = li.querySelector('.btn-delete');
      const uid = `task-${task.id}`;
      checkbox.id = uid;
      checkbox.checked = !!task.completed;
      label.htmlFor = uid;
      label.textContent = task.text;
      if (task.completed) label.classList.add('completed'); else label.classList.remove('completed');
      del.setAttribute('aria-label', `Delete task: ${task.text}`);
      // allow keyboard focus on li for toggle via Enter
      li.tabIndex = 0;
      list.appendChild(li);
    });
  }
});

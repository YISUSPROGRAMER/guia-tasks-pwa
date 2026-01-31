import './style.css'
import { registerSW } from 'virtual:pwa-register'

// Initialize PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user? For now just auto update
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// State
let state = {
  tasks: [],
  sheetUrl: ''
}

// DOM Elements
const taskListEl = document.getElementById('task-list')
const addTaskForm = document.getElementById('add-task-form')
const newTaskInput = document.getElementById('new-task-input')
const emptyStateEl = document.getElementById('empty-tasks')

const configSheetBtn = document.getElementById('config-sheet-btn')
const sheetConfigContainer = document.getElementById('sheet-config-container')
const sheetLinkContainer = document.getElementById('sheet-link-container')
const saveSheetBtn = document.getElementById('save-sheet-btn')
const sheetUrlInput = document.getElementById('sheet-url-input')
const sheetEmptyState = document.getElementById('sheet-empty-state')
const openSheetBtn = document.getElementById('open-sheet-btn')

// Load Data
function loadData() {
  const savedTasks = localStorage.getItem('guia-tasks')
  if (savedTasks) {
    state.tasks = JSON.parse(savedTasks)
  }
  
  const savedSheetUrl = localStorage.getItem('guia-sheet-url')
  if (savedSheetUrl) {
    state.sheetUrl = savedSheetUrl
  }
}

// Save Data
function saveTasks() {
  localStorage.setItem('guia-tasks', JSON.stringify(state.tasks))
  renderTasks()
}

function saveSheetUrl() {
  localStorage.setItem('guia-sheet-url', state.sheetUrl)
  renderSheetWidget()
}

// Render Functions
function renderTasks() {
  taskListEl.innerHTML = ''
  
  if (state.tasks.length === 0) {
    emptyStateEl.classList.remove('hidden')
  } else {
    emptyStateEl.classList.add('hidden')
    
    // Sort: Pending first, then Completed. Within groups, newest first.
    const sortedTasks = [...state.tasks].sort((a, b) => {
      if (a.completed === b.completed) return b.id - a.id
      return a.completed ? 1 : -1
    })

    sortedTasks.forEach(task => {
      const li = document.createElement('li')
      li.className = `task-item flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 ${task.completed ? 'completed' : ''}`
      
      li.innerHTML = `
        <input type="checkbox" class="checkbox-custom" ${task.completed ? 'checked' : ''}>
        <span class="task-text flex-1 text-slate-200 text-sm font-medium breaking-words">${escapeHtml(task.text)}</span>
        <button class="delete-btn text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      `
      
      // Events for this item
      const checkbox = li.querySelector('input')
      checkbox.addEventListener('change', () => toggleTask(task.id))
      
      const deleteBtn = li.querySelector('.delete-btn')
      deleteBtn.addEventListener('click', () => deleteTask(task.id))
      
      taskListEl.appendChild(li)
    })
  }
}

function renderSheetWidget() {
  if (state.sheetUrl) {
    sheetEmptyState.classList.add('hidden')
    sheetLinkContainer.classList.remove('hidden')
    openSheetBtn.href = state.sheetUrl
    sheetUrlInput.value = state.sheetUrl
  } else {
    sheetEmptyState.classList.remove('hidden')
    sheetLinkContainer.classList.add('hidden')
    openSheetBtn.href = '#'
    sheetUrlInput.value = ''
  }
}

// Logic
function addTask(text) {
  const newTask = {
    id: Date.now(),
    text,
    completed: false
  }
  state.tasks.unshift(newTask) // Add to top
  saveTasks()
}

function toggleTask(id) {
  state.tasks = state.tasks.map(t => 
    t.id === id ? { ...t, completed: !t.completed } : t
  )
  saveTasks()
}

function deleteTask(id) {
  if(confirm('¿Borrar tarea?')) {
    state.tasks = state.tasks.filter(t => t.id !== id)
    saveTasks()
  }
}

// Utils
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Event Listeners
addTaskForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const text = newTaskInput.value.trim()
  if (text) {
    addTask(text)
    newTaskInput.value = ''
  }
})

// Sheet Config Toggle
let isConfigOpen = false
configSheetBtn.addEventListener('click', () => {
  isConfigOpen = !isConfigOpen
  if (isConfigOpen) {
    sheetConfigContainer.classList.remove('hidden')
    sheetLinkContainer.classList.add('hidden')
    sheetEmptyState.classList.add('hidden')
    sheetUrlInput.focus()
  } else {
    sheetConfigContainer.classList.add('hidden')
    renderSheetWidget() // Restore view
  }
})

saveSheetBtn.addEventListener('click', () => {
  const url = sheetUrlInput.value.trim()
  if (url) {
    state.sheetUrl = url;
    saveSheetUrl()
    isConfigOpen = false
    sheetConfigContainer.classList.add('hidden')
    renderSheetWidget()
  }
})

// Initialize
loadData()
renderTasks()
renderSheetWidget()

const btnEl = document.getElementById("btn");
const appEl = document.getElementById("app");
const themeToggle = document.getElementById("themeToggle");

// Load saved notes
getNotes().forEach((note) => {
  const noteEl = createNoteEl(note.id, note.heading || "", note.content || "");
  appEl.insertBefore(noteEl, btnEl);
});

function createNoteEl(id, heading = "", content = "") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("note-wrapper");
  wrapper.setAttribute("draggable", true);
  wrapper.dataset.id = id;

  const head = document.createElement("input"); // fixed from <heading>
  head.classList.add("head");
  head.placeholder = "Heading...";
  head.value = heading;

  const note = document.createElement("textarea");
  note.classList.add("note");
  note.placeholder = "Empty Note";
  note.value = content;

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("close-btn");
  closeBtn.innerText = "✖";
  closeBtn.title = "Delete";

  closeBtn.addEventListener("click", () => {
    deleteNote(id, wrapper);
    showToast("Note deleted");
  });

  note.addEventListener("input", () => {
    updateNote(id, head.value, note.value);
  });

  head.addEventListener("input", () => {
    updateNote(id, head.value, note.value);
  });

  // Drag handlers
  wrapper.addEventListener("dragstart", dragStart);
  wrapper.addEventListener("dragover", dragOver);
  wrapper.addEventListener("drop", drop);

  wrapper.appendChild(closeBtn);
  wrapper.appendChild(head);
  wrapper.appendChild(note);
  return wrapper;
}

function addNote() {
  const notes = getNotes();
  const noteObj = {
    id: Math.floor(Math.random() * 100000),
    heading: "",
    content: "",
  };
  const noteEl = createNoteEl(noteObj.id, "", "");
  appEl.insertBefore(noteEl, btnEl);
  notes.push(noteObj);
  saveNote(notes);
  showToast("Note added");
}

function deleteNote(id, element) {
  const notes = getNotes().filter((note) => note.id !== id);
  saveNote(notes);
  appEl.removeChild(element);
}

function updateNote(id, heading, content) {
  const notes = getNotes();
  const target = notes.find((note) => note.id === id);
  if (target) {
    target.heading = heading;
    target.content = content;
    saveNote(notes);
  }
}

function saveNote(notes) {
  localStorage.setItem("note-app", JSON.stringify(notes));
}

function getNotes() {
  return JSON.parse(localStorage.getItem("note-app") || "[]");
}

// Drag-and-drop
let dragSrcEl = null;

function dragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
}

function dragOver(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (dragSrcEl !== target) {
    const children = [...appEl.querySelectorAll(".note-wrapper")];
    const srcIndex = children.indexOf(dragSrcEl);
    const targetIndex = children.indexOf(target);
    if (srcIndex < targetIndex) {
      appEl.insertBefore(dragSrcEl, target.nextSibling);
    } else {
      appEl.insertBefore(dragSrcEl, target);
    }
    reorderNotes();
  }
}

function drop() {
  dragSrcEl = null;
}

function reorderNotes() {
  const reordered = [...appEl.querySelectorAll(".note-wrapper")]
    .filter((el) => el !== btnEl)
    .map((el) => {
      const id = parseInt(el.dataset.id);
      return getNotes().find((n) => n.id === id);
    });
  saveNote(reordered);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("visible"), 100);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => document.body.removeChild(toast), 500);
  }, 2500);
}

// Theme toggle
function setTheme(mode) {
  document.body.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  themeToggle.innerHTML =
    mode === "dark"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
}

themeToggle.addEventListener("click", () => {
  const current = localStorage.getItem("theme") === "dark" ? "light" : "dark";
  setTheme(current);
});

setTheme(localStorage.getItem("theme") || "light");
btnEl.addEventListener("click", addNote);

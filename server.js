// server.js
const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
const FILE = "todos.json";

// CORS configuration for production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://your-app-name.vercel.app",
            "https://your-app-name.vercel.app",
          ]
        : true,
    credentials: true,
  })
);
app.use(express.json());

// Load todos
function loadTodos() {
  if (fs.existsSync(FILE)) {
    return JSON.parse(fs.readFileSync(FILE));
  }
  return [];
}

// Save todos
function saveTodos(todos) {
  fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

// 🟢 GET all todos
app.get("/todos", (req, res) => {
  res.json(loadTodos());
});

// 🟢 Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🟢 ADD a new todo
app.post("/todos", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Task text is required" });

  let todos = loadTodos();
  const newTodo = { id: Date.now(), text, done: false };
  todos.push(newTodo);
  saveTodos(todos);

  res.status(201).json(newTodo);
});

// 🟢 MARK todo as done
app.put("/todos/:id/done", (req, res) => {
  let todos = loadTodos();
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) return res.status(404).json({ error: "Todo not found" });

  todo.done = true;
  saveTodos(todos);

  res.json(todo);
});

// 🟢 UPDATE todo text
app.put("/todos/:id", (req, res) => {
  let todos = loadTodos();
  const id = parseInt(req.params.id);
  const { text } = req.body;

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Task text is required" });
  }

  const idx = todos.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ error: "Todo not found" });

  todos[idx].text = String(text).trim();
  saveTodos(todos);
  res.json(todos[idx]);
});

// 🟢 DELETE a todo
app.delete("/todos/:id", (req, res) => {
  let todos = loadTodos();
  const id = parseInt(req.params.id);
  const filtered = todos.filter((t) => t.id !== id);

  if (filtered.length === todos.length) {
    return res.status(404).json({ error: "Todo not found" });
  }

  saveTodos(filtered);
  res.json({ message: "Todo removed" });
});

// 🟢 DELETE completed todos
app.delete("/todos/completed", (req, res) => {
  let todos = loadTodos();
  const remaining = todos.filter((t) => !t.done);
  const removedCount = todos.length - remaining.length;
  saveTodos(remaining);
  res.json({ message: "Completed todos cleared", removed: removedCount });
});

// 🟢 REORDER todos
app.put("/todos/reorder", (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "order (array of ids) is required" });
  }

  const todos = loadTodos();
  const idToTodo = new Map(todos.map((t) => [t.id, t]));

  // Build new array following provided order (ignore unknown ids)
  const reordered = [];
  for (const id of order) {
    const todo = idToTodo.get(Number(id));
    if (todo) reordered.push(todo);
  }

  // Append any todos not included in the order (to avoid accidental loss)
  if (reordered.length !== todos.length) {
    const remaining = todos.filter((t) => !reordered.includes(t));
    reordered.push(...remaining);
  }

  saveTodos(reordered);
  res.json(reordered);
});

// 🟢 CLEAR all todos
app.delete("/todos", (req, res) => {
  saveTodos([]);
  res.json({ message: "All todos cleared" });
});

// Start server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

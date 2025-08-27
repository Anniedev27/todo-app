// index.js
const fs = require("fs");
const FILE = "todos.json";

// Load tasks from file or start empty
function loadTodos() {
  if (fs.existsSync(FILE)) {
    return JSON.parse(fs.readFileSync(FILE));
  }
  return [];
}

// Save tasks back to file
function saveTodos(todos) {
  fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

// Show usage/help
function showHelp() {
  console.log(`
Usage:
  node index.js add "Task name"   -> Add a new todo
  node index.js list              -> Show all todos
  node index.js done <number>     -> Mark a todo as done
  node index.js remove <number>   -> Remove a todo
  node index.js clear             -> Remove all todos
`);
}

const [, , cmd, ...args] = process.argv;
let todos = loadTodos();

switch (cmd) {
  case "add":
    const task = args.join(" ");
    if (!task) return console.log("Please provide a task name.");
    todos.push({ text: task, done: false });
    saveTodos(todos);
    console.log(`✅ Added: ${task}`);
    break;

  case "list":
    if (todos.length === 0) return console.log("No tasks yet!");
    todos.forEach((t, i) => {
      console.log(`${i + 1}. ${t.done ? "[x]" : "[ ]"} ${t.text}`);
    });
    break;

  case "done":
    const doneIndex = parseInt(args[0]) - 1;
    if (todos[doneIndex]) {
      todos[doneIndex].done = true;
      saveTodos(todos);
      console.log(`✔️ Marked as done: ${todos[doneIndex].text}`);
    } else {
      console.log("Invalid task number.");
    }
    break;

  case "remove":
    const removeIndex = parseInt(args[0]) - 1;
    if (todos[removeIndex]) {
      const removed = todos.splice(removeIndex, 1);
      saveTodos(todos);
      console.log(`🗑 Removed: ${removed[0].text}`);
    } else {
      console.log("Invalid task number.");
    }
    break;

  case "clear":
    saveTodos([]);
    console.log("🧹 Cleared all todos.");
    break;

  default:
    showHelp();
}

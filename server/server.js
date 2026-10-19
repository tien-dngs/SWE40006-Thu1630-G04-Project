const express = require("express")
const cors = require("cors")
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = process.env.DB_path || path.join(__dirname, "../Data/db.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Successfully connected to the SQLite database.");
    }
});

const app = express()
const port = process.env.PORT || 4004

// Middleware
app.use(cors());
app.use(express.json());

// Health Checkpoint
app.get("/api/health", (req, res) => { 
    res.json({ status: "ok", message: "Backend Server is running smoothly." });
});

// GET all tasks
app.get("/api/tasks", (req, res) => {
    db.all("SELECT * FROM notes", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET all user (for admins)
app.get("/api/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


// Creating a new note/task
app.post('/api/tasks', (req, res) => {
    const { id, title, notes, status, ownerId, ownerName, updatedAt } = req.body;

    const query = `INSERT INTO notes (id, title, notes, status, ownerId, ownerName, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [ id, title, notes, status || 'todo', ownerId, ownerName, updatedAt || new Date().toISOString()];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id, title, notes, status : status || 'todo', ownerId, ownerName, updatedAt });
    });
});

// Updating an existing note/task
app.put('/api/tasks/:id', (req, res) => {
    const { title, notes, status } = req.body;
    const taskId = req.params.id;
    const updatedAt = new Date().toISOString();

    const query = `UPDATE notes SET title = coalesce(?, title), notes = coalesce(?, notes), status = coalesce(?, status), updatedAt = ? WHERE id = ?`;
    const params = [title, notes, status, updatedAt, taskId];

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        res.json({ message: "Task updated successfully.", id: taskId });
    });
});


app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const query = `DELETE FROM notes WHERE id = ?`;

    db.run(query, [taskId], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        res.json({ message: "Task deleted successfully.", id: taskId });
    });
});




if (require.main === module) {
    app.listen(port, (error) => {
        if(error){
            console.log('Error occurred while starting the server:', error)
            return
        }

        console.log(`The server is running on http://localhost:${port}`);
    });
}

module.exports = app;
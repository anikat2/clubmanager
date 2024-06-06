const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost", 
    user: "root", 
    password: "",
    database: "test"
});

app.get('/', (req, res) => {
    return res.json('From Backend Side');
});

app.get('/users', (req, res) => {
    const sql = "SELECT * FROM users";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM users WHERE ID = ?";
    db.query(sql, [id], (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.get('/count-per-day', (req, res) => {
    const sql = "SELECT Phone as date, COUNT(*) as count FROM users GROUP BY Phone";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.post('/users', (req, res) => {
    const { ID, Name, Phone, Email } = req.body;
    const today = new Date().toISOString().split('T')[0]; 

    const checkSql = "SELECT * FROM users WHERE ID = ? AND Phone = ?";
    db.query(checkSql, [ID, today], (err, results) => {
        if (err) return res.json(err);
        if (results.length > 0) {
            return res.status(400).json({ error: "ID already exists for today" });
        } else {
            const sql = "INSERT INTO users (ID, Name, Phone, Email) VALUES (?, ?, ?, ?)";
            db.query(sql, [ID, Name, today, Email], (err, result) => {
                if (err) return res.json(err);
                return res.json({ ID, Name, Phone: today, Email });
            });
        }
    });
});

app.listen(8081, () => {
    console.log("Listening...");
});

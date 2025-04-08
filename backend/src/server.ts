import express from "express"; // Explicitly import types
import { Request, Response } from 'express';
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const dbPromise = open({
    filename: "./users.db",
    driver: sqlite3.Database,
});


// Create users table
(async () => {
    const db = await dbPromise;
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);
})();

// Register User
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const db = await dbPromise;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [
            username,
            email,
            hashedPassword,
        ]);
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ error: "Username or email already exists" });
    }
});
// Add this before /login
app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    console.log("Login attempt for:", email); // Log the email being tried
    const db = await dbPromise;

    try {
        console.log("Try/catch");
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            console.log("Email not found");
            return res.status(400).json({error: "Invalid email or password"});
        }
        console.log("Password being checked", password);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log("Password wrong");
            return res.status(400).json({error: "Invalid email or password"});
        }

        // Create JWT token
        const token = jwt.sign({id: user.id, username: user.username}, process.env.JWT_SECRET || "dev_secret", {
            expiresIn: "1h",
        });

        res.json({message: "Login successful", token});
    } catch (error) {
        res.status(500).json({error: "Internal server error"});
    }
});
console.log("Didnt try/catch");

app.get("/users", async (req, res) => {
    const db = await dbPromise;
    const users = await db.all("SELECT id, username, email FROM users");
    res.json(users);
});


// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

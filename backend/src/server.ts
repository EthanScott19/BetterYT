import express, { Request, Response } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Database from "better-sqlite3";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize database
const db = new Database("./users.db");

// Create users table
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`).run();

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
}

// Register User
app.post("/register", (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const stmt = db.prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        stmt.run(username, email, hashedPassword);
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ error: "Username or email already exists" });
    }
});

// Login User
app.post("/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    try {
        const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
        const user = stmt.get(email) as User;

        if (!user) {
            console.log("Email not found");
            return res.status(400).json({ error: "Invalid email or password" });
        }

        console.log("Password being checked", password);
        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            console.log("Password wrong");
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET || "dev_secret",
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get all users (for testing)
app.get("/users", (req: Request, res: Response) => {
    const stmt = db.prepare("SELECT id, username, email FROM users");
    const users = stmt.all();
    res.json(users);
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

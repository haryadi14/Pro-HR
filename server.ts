import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "hr-secret-key-123";
const DB_FILE = path.join(process.cwd(), "db.json");

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [],
    attendance: [],
    reports: []
  }, null, 2));
}

const getDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const saveDB = (data: any) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name, role } = req.body;
    const db = getDB();

    if (db.users.find((u: any) => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role: role || "employee"
    };

    db.users.push(newUser);
    saveDB(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = db.users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  // Attendance Routes
  app.post("/api/attendance", authenticateToken, (req: any, res) => {
    const { type, location } = req.body;
    const db = getDB();
    
    const entry = {
      id: Date.now().toString(),
      userId: req.user.id,
      type,
      location,
      timestamp: new Date().toISOString()
    };

    db.attendance.push(entry);
    saveDB(db);
    res.json(entry);
  });

  app.get("/api/attendance/my", authenticateToken, (req: any, res) => {
    const db = getDB();
    const myAttendance = db.attendance.filter((a: any) => a.userId === req.user.id);
    res.json(myAttendance);
  });

  // Reports Routes
  app.post("/api/reports", authenticateToken, (req: any, res) => {
    const { content } = req.body;
    const db = getDB();
    
    const report = {
      id: Date.now().toString(),
      userId: req.user.id,
      content,
      date: new Date().toISOString()
    };

    db.reports.push(report);
    saveDB(db);
    res.json(report);
  });

  app.get("/api/reports/my", authenticateToken, (req: any, res) => {
    const db = getDB();
    const myReports = db.reports.filter((r: any) => r.userId === req.user.id);
    res.json(myReports);
  });

  // Admin Routes
  app.get("/api/admin/all-data", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") return res.sendStatus(403);
    const db = getDB();
    res.json(db);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

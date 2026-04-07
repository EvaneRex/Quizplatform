import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import validerLogin from "../middleware/validerLogin.js";
import validerOpretBruger from "../middleware/validerOprettelse.js";
import {
  lockout,
  incrementAttempts,
  resetAttempts,
  loginLimiter,
} from "../middleware/lockout.js";

const router = express.Router();

// Login delen med lockout + rate limiting
router.post("/login", loginLimiter, validerLogin, lockout, async (req, res) => {
  const { username, password } = req.body;
  const usersPath = "./users/users.json";
  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath))
    : [];

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ message: "Brugernavn findes ikke" }); // Anden fejlbesked skal ind, det skal generaliseres 🙃

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    incrementAttempts(false);
    return res.status(401).json({ message: "Forkert adgangskode" }); // Anden fejlbesked skal ind, det skal generaliseres 🙃
  }

  req.session.user = { username: user.username, role: user.role };
  res.json({ message: "Login succesfuldt", role: user.role });

  // succesfuldt login: nulstil tæller
  resetAttempts();
});

// Opret bruger delen
router.post("/opretBruger", validerOpretBruger, async (req, res) => {
  const { username, password, role } = req.body;
  const usersPath = "./users/users.json";
  let users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath))
    : [];

  if (users.find((userObj) => userObj.username === username)) {
    return res.status(400).json({ message: "Brugeren eksistere allerede" }); // ikke det mest sikre men eh
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, role: role || "user" });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  res.json({ message: "Brugeren er oprettet" });
});

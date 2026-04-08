import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import crypto from "crypto";
import validerLogin from "../middleware/validerLogin.js";
import validerOpretBruger from "../middleware/validerOprettelse.js";
import { requireLogin } from "../middleware/validerRolle.js";
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
    ? JSON.parse(fs.readFileSync(usersPath, "utf-8"))
    : [];

  const user = users.find((u) => u.username === username);
  const match = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !match) {
    incrementAttempts(false, req);
    return res
      .status(401)
      .json({ message: "Brugernavn eller adgangskode er forkert" });
  }

  // succesfuldt login: nulstil tæller
  resetAttempts(req);
  req.session.user = {
    username: user.username,
    role: user.role,
    id: user.id,
    email: user.email,
  };
  res.json({ message: "Login succesfuldt", role: user.role });
});

// Opret bruger delen
router.post("/opretBruger", validerOpretBruger, async (req, res) => {
  const { username, email, password } = req.body;
  const usersPath = "./users/users.json";
  let users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, "utf-8"))
    : [];

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
    role: "student",
    twoFactorEnabled: false,
    secret: null,
  });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ message: "Brugeren er oprettet" });
});

// Hent nuværende bruger (bruges fx til at vise admin-knapper i frontend)
router.get("/me", requireLogin, (req, res) => {
  res.json(req.session.user);
});

export default router;

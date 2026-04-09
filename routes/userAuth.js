import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
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

// Login delen med lockout + rate limiting + TOTP
router.post("/login", loginLimiter, validerLogin, lockout, async (req, res) => {
  const { username, password } = req.body;
  const usersPath = "./users/users.json";
  const users = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, "utf-8"))
    : [];

  const user = users.find((u) => u.username === username);
  const match = user ? await bcrypt.compare(password, user.password) : false;
  if (!user || !match) {
    incrementAttempts(false, username);
    return res
      .status(401)
      .json({ message: "Brugernavn eller adgangskode er forkert" });
  }

  resetAttempts(username);

  if (!user.twoFactorEnabled) {
    if (!user.secret) {
      const secret = speakeasy.generateSecret({ length: 20 });
      user.secret = secret.base32;
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    }

    req.session.mfaUserId = user.id;

    const otpauthUrl = speakeasy.otpauthURL({
      secret: user.secret,
      label: `QuizPlatform:${username}`,
      issuer: "QuizPlatform",
      encoding: "base32",
    });

    return res.json({
      message: "MFA påkrævet – scan QR-kode med Authenticator-app",
      mfaRequired: true,
      otpauthUrl,
    });
  }

  req.session.user = {
    username: user.username,
    role: user.role,
    id: user.id,
    email: user.email,
  };
  res.json({ message: "Login succesfuldt", role: user.role });
});

router.post("/verify-mfa", (req, res) => {
  const { code } = req.body;

  const userId = req.session.mfaUserId;
  if (!userId) return res.status(400).json({ message: "Ingen MFA session" });

  const users = JSON.parse(fs.readFileSync("./users/users.json", "utf-8"));
  const user = users.find((u) => u.id === userId);

  if (!user || !user.secret)
    return res.status(400).json({ message: "MFA ikke opsat" });

  const verified = speakeasy.totp.verify({
    secret: user.secret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) return res.status(401).json({ message: "Forkert kode" });

  user.twoFactorEnabled = true;
  fs.writeFileSync("./users/users.json", JSON.stringify(users, null, 2));

  req.session.user = {
    username: user.username,
    role: user.role,
    id: user.id,
    email: user.email,
  };
  delete req.session.mfaUserId;
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
  const secret = speakeasy.generateSecret({ length: 20 }).base32;
  users.push({
    id: crypto.randomUUID(),
    username,
    email,
    password: hashedPassword,
    role: "student",
    twoFactorEnabled: false,
    secret,
  });
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.json({ message: "Brugeren er oprettet" });
});

// Hent nuværende bruger (bruges fx til at vise admin-knapper i frontend)
router.get("/me", requireLogin, (req, res) => {
  res.json(req.session.user);
});

export default router;

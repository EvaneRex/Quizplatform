import express from "express";
import session from "express-session";
import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });
import path from "path";
import "dotenv/config";
import userAuthRoutes from "./routes/userAuth.js";
import quizRoutes from "./routes/quiz.routes.js";
import { requireLogin, requireRole } from "./middleware/validerRolle.js";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let results = [];

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//valider quiz ved upload
const schema = JSON.parse(fs.readFileSync("schemas/quiz.schema.json", "utf-8"));
const validateQuiz = ajv.compile(schema);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // I production bør dette sættes til true for at sikre, at cookies kun sendes over HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 time
    },
  }),
);

// Routes
app.get("/", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/dashboard");
  }
  return res.sendFile(path.join(__dirname, "public", "login.html"));
});
// Dashboard til hver, på den måde kan studerende ikke bruge udviklerværktøj til at se admin
// Alle de steder hvor studerende ikke skal have adgang, skal der være en requireRole("admin") middleware, og på de steder hvor man skal være logget ind, men ikke nødvendigvis admin, skal der være requireLogin middleware

app.get("/dashboard", requireLogin, (req, res) => {
  if (req.session.user.role === "admin") {
    return res.sendFile(path.join(__dirname, "public", "dashboard-admin.html"));
  }
  return res.sendFile(path.join(__dirname, "public", "dashboard-student.html"));
});

app.post("/results", requireLogin, (req, res) => {
  const { username, quizId, score, total, time } = req.body;
  results.push({
    username,
    quizId,
    score,
    total,
    time,
    date: new Date(),
  });
  res.json({ message: "Resultat gemt" });
});

// ----- LOGOUT -----
app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Kunne ikke logge ud" });
    }
    res.json({ message: "Du er logget ud" });
  });
});

app.use("/quiz", quizRoutes);
app.use("/auth", userAuthRoutes);

// Server stuff
app.listen(PORT, () => {
  console.log(`Serveren kører på http://localhost:${PORT}`);
});

import express from "express";
import session from "express-session";
import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });
import path from "path";
import "dotenv/config";
import userAuthRouter from "./routes/userAuth.js";
import quizRoutes from "./routes/quiz.routes.js";
import { requireLogin, requireRole } from "./middleware/validerRolle.js";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let results = [];

const app = express();
const PORT = 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // I production bør dette sættes til true for at sikre, at cookies kun sendes over HTTPS
      sameSite: "lax",
      // maxAge: 1000 * 60 * 60, // 1 time
    },
  }),
);
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//valider quiz ved upload
const schema = JSON.parse(fs.readFileSync("schemas/quiz.schema.json", "utf-8"));
const validateQuiz = ajv.compile(schema);

// Routes
app.get("/", (req, res) => {
  if (req.session?.user) {
    return res.redirect("/dashboard");
  }
  return res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.use("/auth", userAuthRouter);

// Dashboard til hver, på den måde kan studerende ikke bruge udviklerværktøj til at se admin
// Alle de steder hvor studerende ikke skal have adgang, skal der være en requireRole("admin") middleware, og på de steder hvor man skal være logget ind, men ikke nødvendigvis admin, skal der være requireLogin middleware

app.get("/dashboard", requireLogin, (req, res) => {
  if (req.session.user.role === "admin") {
    return res.sendFile(
      path.join(__dirname, "private", "dashboard-admin.html"),
    );
  }
  return res.sendFile(
    path.join(__dirname, "private", "dashboard-student.html"),
  );
});

// Det er en rolle begrænset route til student dashboard, så admin kan navigere mellem de to men student roller ikke kan
app.get(
  "/dashboard-student-view",
  requireLogin,
  requireRole("admin"),
  (req, res) => {
    res.sendFile(path.join(__dirname, "private", "dashboard-student.html"));
  },
);

app.post("/results", requireLogin, (req, res) => {
  const { quizId, score, total, time } = req.body;
  const userId = req.session.user.id;
  const username = req.session.user.username;

  const quizPath = path.join(__dirname, "quizzes", quizId + ".json");

  let quizName = "Ukendt quiz";

  if (fs.existsSync(quizPath)) {
    const quizData = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
    quizName = quizData.title;
  }

  results.push({
    userId,
    username,
    quizId,
    quizName, 
    score,
    total,
    time,
    date: new Date(),
  });

    console.log("SESSION USER:", req.session.user);


  res.json({ message: "Resultat gemt" });
});

app.get("/results/me", requireLogin, (req, res) => {
  const username = req.session.user.username;

  const userResults = results.filter((result) => result.username === username);

  res.json(userResults);
});

app.get("/results/all", requireLogin, requireRole("admin"), (req, res) => {
  res.json(results);
});

app.use("/quiz", quizRoutes);

// ----- Upload quiz -----
app.post("/quiz/upload", requireLogin, requireRole("admin"), (req, res) => {
  const quiz = req.body;

  const valid = validateQuiz(quiz);
  if (!valid) {
    console.error("Quiz validation errors:", validateQuiz.errors);
    return res.status(400).json({
      message: "Ugyldigt quiz-format",
      errors: validateQuiz.errors,
    });
  }

  try {
    const quizFolder = path.join(__dirname, "quizzes");
    if (!fs.existsSync(quizFolder)) {
      fs.mkdirSync(quizFolder, { recursive: true });
    }

    const id = Date.now().toString();
    const filePath = path.join(quizFolder, id + ".json");

    fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2), "utf-8");

    res.json({ message: "Quiz uploadet", id });
  } catch (err) {
    console.error("Fejl ved gemning af quiz:", err);
    res.status(500).json({ message: "Kunne ikke gemme quiz" });
  }
});

// ----- LOGOUT -----
app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fejl ved logout:", err);
      return res.sendStatus(500);
    }
    res.sendStatus(204);
  });
});

// Server stuff
app.listen(PORT, () => {
  console.log(`Serveren kører på http://localhost:${PORT}`);
});

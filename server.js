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
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const resultsPath = path.join(__dirname, "data", "results.json");
const upload = multer({ dest: "uploads/" });

function getResults() {
  if (!fs.existsSync(resultsPath)) return [];
  return JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
}

function saveResults(results) {
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
}

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
  try {
    const { quizId, score, total, time, startTime, answers } = req.body;
    const userId = req.session.user.id;
    const username = req.session.user.username;

    const quizPath = path.join(__dirname, "quizzes", quizId + ".json");

    let quizName = "Ukendt quiz";
    let quizData = null;

    if (fs.existsSync(quizPath)) {
      quizData = JSON.parse(fs.readFileSync(quizPath, "utf-8"));
      quizName = quizData.title;
    }

    const enrichedAnswers = answers.map((a, i) => {
      const correct = quizData?.questions?.[i]?.correct || [];

      return {
        question: a.question,
        selected: a.selected,
        answers: a.answers || [],
        correct,
      };
    });

    const results = getResults();

    results.push({
      userId,
      username,
      quizId,
      quizName,
      score,
      total,
      time,
      startTime,
      answers: enrichedAnswers,
      date: new Date(),
    });

    saveResults(results);

    console.log("GEMT RESULTAT:", username);

    res.json({ message: "Resultat gemt" });
  } catch (err) {
    console.error("FEJL i /results:", err);
    res.status(500).json({ error: "Kunne ikke gemme resultat" });
  }
});

app.get("/results/me", requireLogin, (req, res) => {
  try {
    const username = req.session.user.username;

    const results = getResults();

    const userResults = results.filter((r) => r.username === username);

    res.json(userResults);
  } catch (err) {
    console.error("FEJL i /results/me:", err);
    res.status(500).json({ error: "Server fejl" });
  }
});

app.get("/results/all", requireLogin, requireRole("admin"), (req, res) => {
  const results = getResults();
  res.json(results);
});

// ----- Upload quiz -----
app.get("/quiz/list", requireLogin, requireRole("admin"), (req, res) => {
  const folderPath = path.join(__dirname, "quizzes");
  console.log("Tjek sti:", folderPath);

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Fejl ved læsning af mappen:", err);
      return res.status(500).json({ error: "Kunne ikke læse mappen" });
    }

    const quizFiles = files.filter((f) => f.endsWith(".json"));
    res.json(quizFiles);
  });
});

app.delete(
  "/quiz/:filename",
  requireLogin,
  requireRole("admin"),
  (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "quizzes", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Quiz ikke fundet" });
    }

    try {
      fs.unlinkSync(filePath);
      res.json({ message: "Quiz slettet succesfuldt" });
    } catch (err) {
      console.error("Fejl ved sletning:", err);
      res.status(500).json({ message: "Kunne ikke slette quizzen" });
    }
  },
);

app.post(
  "/quiz/upload",
  requireLogin,
  requireRole("admin"),
  upload.single("file"),
  (req, res) => {
    console.log("UPLOAD ROUTE RAMT"); // TEST

    try {
      if (!req.file) {
        return res.status(400).json({ message: "Ingen fil uploadet" });
      }

      const fileContent = fs.readFileSync(req.file.path, "utf-8");

      let quiz;
      try {
        quiz = JSON.parse(fileContent);
      } catch (err) {
        return res.status(400).json({ message: "Ugyldigt JSON format" });
      }

      const valid = validateQuiz(quiz);

      if (!valid) {
        console.error("VALIDATION FEJL:", validateQuiz.errors);
        return res.status(400).json({
          message: "Quiz validerede ikke",
          errors: validateQuiz.errors,
        });
      }

      const quizFolder = path.join(__dirname, "quizzes");
      if (!fs.existsSync(quizFolder)) {
        fs.mkdirSync(quizFolder);
      }

      const id = Date.now().toString();
      const filePath = path.join(quizFolder, id + ".json");

      fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2));

      fs.unlinkSync(req.file.path);

      res.json({ message: "Quiz uploadet succesfuldt" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server fejl ved upload" });
    }
  },
);

app.use("/quiz", quizRoutes);

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

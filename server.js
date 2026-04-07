import express from "express";
import session from "express-session";
import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });
import "dotenv/config";
import userAuthRoutes from "./routes/userAuth.js";
import quizRoutes from "./routes/quiz.routes.js";
import fs from "fs";

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
app.use("/quiz", quizRoutes);

app.post("/results", (req, res) => {
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

app.get("/results/me", (req, res) => {
  const { username } = req.body;

  const userResults = results.filter((result) => result.username === username);

  res.json(userResults);
});

app.use("/auth", userAuthRoutes);

// beskyt ruter der kræver login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Ikke logget ind" });
  }
  next();
}

// Server stuff

app.listen(PORT, () => {
  console.log(`Serveren kører på http://localhost:${PORT}`);
});

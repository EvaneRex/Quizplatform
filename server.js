import express from "express";
import session from "express-session";
// import bcrypt from "bcrypt";
import Ajv from "ajv";
const ajv = new Ajv({ allErrors: true });
import "dotenv/config";
import userAuthRoutes from "./routes/userAuth.js";
let results = [];

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//valider quiz ved upload
const schema = JSON.parse(
  fstat.readFileSync("schemas/quiz.schema.json", "utf-8"),
);
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
      //   maxAge: 1000 * 60 * 60, // 1 time
    },
  }),
);

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

// Går ind på userAuth.js
app.use("/auth", userAuthRoutes);

app.get("/", (req, res) => {
  res.send("Serveren kører");
});

app.listen(PORT, () => {
  console.log(`Serveren kører på http://:${PORT}`);
});

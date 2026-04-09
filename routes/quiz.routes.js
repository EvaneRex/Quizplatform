import express from "express";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get("/", (req, res) => {
  const quizFolder = path.join(__dirname, "../quizzes");

  const files = fs.readdirSync(quizFolder);

  const quizzes = files.map((file) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(quizFolder, file), "utf-8"),
    );

    return {
      id: file.replace(".json", ""),
      title: data.title,
    };
  });

  res.json(quizzes);
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const filePath = path.join(__dirname, "../quizzes", id + ".json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Quiz ikke fundet" });
  }

  const data = fs.readFileSync(filePath, "utf-8");
  const quiz = JSON.parse(data);

  // Randomiser spørgsmål
  quiz.questions.sort(() => Math.random() - 0.5);

  // Fjern correct + lav mapping
  const safeQuestions = quiz.questions.map((q) => {
    if (q.type === "cloze") {
      return {
        type: q.type,
        question: q.question,
        answers: [],
        mapping: [],
      };
    }

    const answersWithIndex = q.answers.map((text, index) => ({
      text,
      originalIndex: index,
    }));

    answersWithIndex.sort(() => Math.random() - 0.5);

    return {
      type: q.type,
      question: q.question,
      answers: answersWithIndex.map((a) => a.text),
      mapping: answersWithIndex.map((a) => a.originalIndex),
    };
  });


  res.json({
    id: id,
    title: quiz.title,
    questions: safeQuestions,
  });
}); 

router.post("/answer", (req, res) => {
  const { quizId, questionIndex, selected, mapping } = req.body;

  const filePath = path.join(__dirname, "../quizzes", quizId + ".json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Quiz ikke fundet" });
  }

  const quiz = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const question = quiz.questions[questionIndex];
  const correct = question.correct;

  let mapped = null;

//CLOZE
  if (question.type === "cloze") {
    const isCorrect =
      selected.toString().trim().toLowerCase() ===
      correct.toString().trim().toLowerCase();

    return res.json({
      correct: isCorrect,
      points: isCorrect ? 1 : 0,
    });
  }

  // håndterer single vs multiple
  if (Array.isArray(selected)) {
    mapped = selected.map((i) => mapping[i]);
  } else {
    mapped = mapping[selected];
  }

  let isCorrect;
  let points = 0;


  // MULTIPLE
  if (Array.isArray(mapped)) {
    const correctSet = correct;

    const correctChosen = mapped.filter((x) =>
      correctSet.includes(x),
    ).length;
    const wrongChosen = mapped.filter((x) =>
      !correctSet.includes(x),
    ).length;

    const totalCorrect = correctSet.length;

    points = correctChosen / totalCorrect - wrongChosen / totalCorrect;

    if (points < 0) points = 0;

    isCorrect = points === 1;
  }

  // SINGLE
  else {
    isCorrect = correct.includes(mapped);
    points = isCorrect ? 1 : 0;
  }

  res.json({
    correct: isCorrect,
    points: points,
  });
});

export default router;
import express from "express";
import fs from "fs";
import path from "path";
import sanitizeHtml from "sanitize-html";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Tillad kun sikre HTML tags
function cleanHtml(input) {
  return sanitizeHtml(input || "", {
    allowedTags: ["strong", "br", "span"],
    allowedAttributes: {
      span: ["style"],
    },
    allowedStyles: {
      span: {
        "font-style": [/italic/],
        "text-decoration": [/underline/],
      },
    },
  });
}

// Hent alle quizzes
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

// Hent én quiz
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const filePath = path.join(__dirname, "../quizzes", id + ".json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Quiz ikke fundet" });
  }

  const quiz = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Shuffle spørgsmål
  const shuffledQuestions = quiz.questions
    .map((q, i) => ({
      ...q,
      originalId: i,
    }))
    .sort(() => Math.random() - 0.5);

  const safeQuestions = shuffledQuestions.map((q) => {
    // CLOZE
    if (q.type === "cloze") {
      return {
        id: q.origialId,
        type: q.type,
        question: cleanHtml(q.question),
        answers: [],
        mapping: [],
      };
    }

    // Byg svar med original index
    const answersWithIndex = (q.answers || []).map((answer, i) => ({
      text: answer,
      originalIndex: i,
    }));

    // Shuffle svar
    answersWithIndex.sort(() => Math.random() - 0.5);

    return {
      id: q.originalId,
      type: q.type,
      question: cleanHtml(q.question),
      answers: answersWithIndex.map((a) => cleanHtml(a.text)),
      mapping: answersWithIndex.map((a) => a.originalIndex),
    };
  });

  res.json({
    id,
    title: quiz.title,
    questions: safeQuestions,
  });
});

// Tjek svar
router.post("/answer", (req, res) => {
  const { quizId, questionId, selected, mapping } = req.body;

  const filePath = path.join(__dirname, "../quizzes", quizId + ".json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Quiz ikke fundet" });
  }

  const quiz = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const question = quiz.questions.find((q, i) => i == questionId);
  if (!question) {
    return res.status(400).json({ error: "Spørgsmål ikke fundet" });
  }

  const correct = question.correct;

  let mapped;

  // CLOZE
  if (question.type === "cloze") {
    if (!selected || !correct) {
      return res.json({ correct: false, points: 0 });
    }

    const correctAnswers = correct
      .split(",")
      .map((s) => s.trim().toLowerCase());

    const userAnswers = selected
      .toString()
      .split(",")
      .map((s) => s.trim().toLowerCase());

    const isCorrect =
      correctAnswers.length === userAnswers.length &&
      correctAnswers.every((ans) => userAnswers.includes(ans));

    return res.json({
      correct: isCorrect,
      points: isCorrect ? 1 : 0,
    });
  }

  // SINGLE / MULTIPLE mapping
  if (Array.isArray(selected)) {
    mapped = selected.map((i) => mapping?.[parseInt(i)]);
  } else {
    mapped = mapping?.[parseInt(selected)];
  }

  let isCorrect = false;
  let points = 0;

  // MULTIPLE
  if (Array.isArray(mapped)) {
    const correctSet = correct || [];

    const correctChosen = mapped.filter((x) => correctSet.includes(x)).length;

    const wrongChosen = mapped.filter((x) => !correctSet.includes(x)).length;

    const totalCorrect = correctSet.length || 1;

    points = correctChosen / totalCorrect - wrongChosen / totalCorrect;

    if (points < 0) points = 0;

    isCorrect = points === 1;
  }

  // SINGLE
  else {
    isCorrect = (correct || []).includes(mapped);
    points = isCorrect ? 1 : 0;
  }

  res.json({
    correct: isCorrect,
    points,
  });
});

export default router;

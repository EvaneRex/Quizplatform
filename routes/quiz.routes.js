const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

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
    // Lav svar + original index
    const answersWithIndex = q.answers.map((text, index) => ({
      text,
      originalIndex: index,
    }));

    // Shuffle svar
    answersWithIndex.sort(() => Math.random() - 0.5);

    return {
      type: q.type,
      question: q.question,
      answers: answersWithIndex.map((a) => a.text),

      // holder styr på den orignale position for at kunne tjekke svar senere
      mapping: answersWithIndex.map((a) => a.originalIndex),
    };
  });

  res.json({
    id: id,
    title: quiz.title,
    questions: safeQuestions,
  });
});

module.exports = router;

router.post("/answer", (req, res) => {
  const { quizId, questionIndex, selected, mapping } = req.body;

  const filePath = path.join(__dirname, "../quizzes", quizId + ".json");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Quiz ikke fundet" });
  }

  const quiz = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const question = quiz.questions[questionIndex];
  const correct = question.correct;

  let mapped;

  // håndterer single vs multiple
  if (Array.isArray(selected)) {
    mapped = selected.map((i) => mapping[i]);
  } else {
    mapped = mapping[selected];
  }

  let isCorrect;

  if (Array.isArray(mapped)) {
    isCorrect =
      JSON.stringify(mapped.sort()) === JSON.stringify(correct.sort());
  } else {
    isCorrect = correct.includes(mapped);
  }

  res.json({ correct: isCorrect });
});

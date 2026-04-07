const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Load quizzes from the JSON file

router.get("/:id", (req, res) => {
  const id = req.params.id;
  const filePath = path.join(__dirname, '../quizzes", id + ".json');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Quiz ikke fundet" });
  }

  const data = fs.readFileSync(filePath, "utf-8");
  const quiz = JSON.parse(data);

  //randomiser rækkefølgen af spørgsmålene
  quiz.questions.sort(() => Math.random() - 0.5);

  //Fjerner coorect
  const safeQuestions = quiz.questions.map((q) => {
    let answers = [...q.answers];
    answers.sort(() => Math.random() - 0.5);
    return {
      type: q.type,
      question: q.question,
      answers: answers,
    };
  });

  res.json({
    id: quiz.id,
    title: quiz.title,
    questions: safeQuestions,
  });
});

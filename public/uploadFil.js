function handleUpload() {
  const file = document.getElementById("fileInput").files[0];

  if (!file) {
    alert("Vælg en fil!");
    return;
  }

  const fileType = file.name.split(".").pop().toLowerCase();

  if (fileType !== "json") {
    alert("Kun JSON-filer er tilladt!");
    return;
  }

  readJSON(file);
}

function readJSON(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const quiz = JSON.parse(e.target.result);

      if (validateQuiz(quiz)) {
        saveQuiz(quiz);
      } else {
        alert("Ugyldigt quiz-format!");
      }
    } catch (err) {
      console.error(err);
      alert("Kunne ikke læse JSON-filen");
    }
  };

  reader.readAsText(file);
}

function validateQuiz(quiz) {
  if (!quiz || !quiz.title || !Array.isArray(quiz.questions)) return false;

  for (let q of quiz.questions) {
    if (!q.question || !q.answers || !q.correct) return false;

    if (!Array.isArray(q.answers) || q.answers.length < 2) return false;

    if (!Array.isArray(q.correct)) return false;
  }

  return true;
}

function saveQuiz(quiz) {
  fetch("/quiz/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quiz),
  })
    .then((res) => {
      if (!res.ok) {
        return res
          .json()
          .catch(() => ({}))
          .then((body) => {
            const msg = body && body.message ? body.message : "Upload fejlede";
            throw new Error(msg);
          });
      }
      return res.json();
    })
    .then((data) => {
      alert("Quiz uploadet!");
      console.log("Uploadet quiz-id:", data.id);
    })
    .catch((err) => {
      console.error(err);
      alert("Fejl under upload af quiz: " + err.message);
    });
}

// For debugging: log evt. eksisterende quizzes i localStorage (kan fjernes)
const quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");
console.log("Lokale quizzes (ikke længere brugt til upload):", quizzes);

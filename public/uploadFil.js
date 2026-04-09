function handleUpload() {
  const file = document.getElementById("fileInput").files[0];

  if (!file) {
    alert("Vælg en fil!");
    return;
  }

  const fileType = file.name.split(".").pop().toLowerCase();

  if (fileType === "json") {
    readJSON(file);
  } else if (fileType === "xlsx" || fileType === "xls") {
    readExcel(file);
  } else {
    alert("Kun JSON eller Excel filer er tilladt!");
  }
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

function readExcel(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const quiz = {
        title: file.name,
        questions: [],
      };

      rows.forEach((row) => {
        const answers = [];

        Object.keys(row).forEach((key) => {
          if (key.toLowerCase().startsWith("answer")) {
            answers.push(row[key]);
          }
        });

        const correct = String(row.correct || "")
          .split(",")
          .map((n) => Number(String(n).trim()))
          .filter((n) => !Number.isNaN(n));

        quiz.questions.push({
          type: correct.length > 1 ? "multiple" : "single",
          question: row.question,
          answers: answers,
          correct: correct,
        });
      });

      if (validateQuiz(quiz)) {
        saveQuiz(quiz);
      } else {
        alert("Excel-data er ugyldig!");
      }
    } catch (err) {
      console.error(err);
      alert("Kunne ikke læse Excel-filen");
    }
  };

  reader.readAsArrayBuffer(file);
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

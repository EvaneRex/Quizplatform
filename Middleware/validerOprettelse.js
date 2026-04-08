import fs from "fs";
const usersPath = "./users/users.json";

function getUsers() {
  if (!fs.existsSync(usersPath)) return [];
  return JSON.parse(fs.readFileSync(usersPath, "utf-8"));
}

const validerOprettelse = (req, res, next) => {
  let { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      message: "Alle felter skal udfyldes",
    });
  }

  req.body.role = "student";

  const brugernavnRegex =
    /^(?=(?:.*[a-zæøå]){3,})(?=(?:.*\d){0,5})[a-zæøå\d!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]{3,20}$/i;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const kodeRegex =
    /^(?=.*[a-zæøå])(?=.*[A-ZÆØÅ])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Tjekker om brugernavn, email og password opfylder krav, giver specifikke fejlbeskeder
  if (!brugernavnRegex.test(username)) {
    return res.status(400).json({
      message: "Ugyldigt brugernavn",
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Ugyldig email",
    });
  }

  if (!kodeRegex.test(password)) {
    return res.status(400).json({
      message: "Adgangskoden er ikke stærk nok",
    });
  }

  // Vi tjekker om email og brugernavn allerede findes
  const users = getUsers();

  if (users.find((u) => u.email === email || u.username === username)) {
    return res.status(400).json({
      message: "Bruger eksistere allerede",
    });
  }

  next();
};

export default validerOprettelse;

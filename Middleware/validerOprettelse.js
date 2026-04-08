// Skal tage info fra opretBruger.html og tjekke
// 1) eksisterer brugeren allerede - hvis ja, så skal der være en fejlbesked
// 2) er password stærk nok? - fejlbesked som informere om den er stærknok
// 3) er felterne udfyldt? - fejlbesked som informere om at alle felter skal udfyldes
// 4) er alt godkendt, så besked om at oprettelsen er lykkedes

// Skal brugeren bruge sin email når de opretter sig?

const validerOprettelse = (req, res, next) => {
  let { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      message: "Brugernavn, email og adgangskode skal udfyldes",
    });
  }

  req.body.role = "student";

  const brugernavnRegex =
    /^(?=(?:.*[a-zæøå]){3,})(?=(?:.*\d){0,5})[a-zæøå\d!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]{3,20}$/i;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const kodeRegex =
    /^(?=.*[a-zæøå])(?=.*[A-ZÆØÅ])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

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
  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({
      message: "Email findes allerede",
    });
  }

  if (!kodeRegex.test(password)) {
    return res.status(400).json({
      message: "Adgangskoden er ikke stærk nok",
    });
  }

  next();
};

export default validerOprettelse;

// Skal tage info fra opretBruger.html og tjekke
// 1) eksisterer brugeren allerede - hvis ja, så skal der være en fejlbesked
// 2) er password stærk nok? - fejlbesked som informere om den er stærknok
// 3) er felterne udfyldt? - fejlbesked som informere om at alle felter skal udfyldes
// 4) er alt godkendt, så besked om at oprettelsen er lykkedes

// Skal brugeren bruge sin email når de opretter sig?

const validerOprettelse = (req, res, next) => {
  let { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Brugernavn og adgangskode skal udfyldes" });
  }

  const brugernavnRegex =
    /^(?=(?:.*[a-zæøå]){3,})(?=(?:.*\d){0,5})[a-zæøå\d!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]{1,20}$/i; // der tillades dk bogstaver, og der skal mindst være 3, og max være 5 tal, og længden af brugernavnet må max være 20 bogstaver
  const kodeRegex =
    /^(?=.*[a-zæøå])(?=.*[A-ZÆØÅ])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  if (!brugernavnRegex.test(username)) {
    return res.status(400).json({ message: "Brugernavn skal være..." }); // regler for brugernavn
  }
  if (!kodeRegex.test(password)) {
    return res.status(400).json({ message: "Adgangskoden er ikke stærk nok" }); // skal der være en slider?
  }
  next();
};

export default validerOprettelse;

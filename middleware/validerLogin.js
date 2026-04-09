// kode fra tidligere projekt!! ret til
// Skal måske tjekke rolle, kan være vi ordner det hele via serveren.

const validerLogin = (req, res, next) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Brugernavn eller adgangskode er forkert" });
  }

  const brugernavnRegex =
    /^(?=(?:.*[a-zæøå]){3,})(?=(?:.*\d){0,5})[a-zæøå\d!@#$%^&*()_+\-=\[\]{};:'"\\|,.<>\/?]{1,20}$/i; // regex skal rettes og tilpasses til bruger navn(skal vi lave et regelsæt for dem?)
  const kodeRegex =
    /^(?=.*[a-zæøå])(?=.*[A-ZÆØÅ])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  if (!brugernavnRegex.test(username) || !kodeRegex.test(password)) {
    return res
      .status(400)
      .json({ message: "Brugernavn eller adgangskode er forkert" });
  }

  next();
};

export default validerLogin;

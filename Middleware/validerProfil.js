// 1) skal validere at alle nødvendige felter er udfyldt
// 2) skal validere at email er gyldig
// 3) skal validere at password er korrekt
// 4) skal låse kontoen midlertidigt efter 3 fejlede loginforsøg
// Hvis alt er ok, skal der logges ind

const validerProfil = (req, res, next) => {
  const { email, password } = req.body;

  // hvis email eller password ikke er udfyldt, returner fejl
  if (!email || !password) {
    return res.status(400).json({ error: "Email og password er påkrævet" });
  }

  // hvis email ikke existerer i databasen, returner fejl
  if (email !== "") {
    return res.status(400).json({ error: "Email findes ikke" });
  }

  // hvis password er forkert, returner fejl
  if (password !== "") {
    return res.status(400).json({ error: "Forkert password" });
  }

  // hvis alt er ok, fortsæt til næste middleware
  next();
};

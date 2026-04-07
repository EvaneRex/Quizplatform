// lås brugere ud efter 5 mislykkede loginforsøg i 15 minutter
let attemptsCounter = 0;
const maxAttempts = 3;

function isOkay() {
  return loginSuccess === true;
}

function lockout(req, res, next) {
  if (attemptsCounter >= maxAttempts) {
    return res.status(403).json({ message: "Konto låst i 15 minutter." });
  }
  next();
}

function incrementAttempts(loginSuccess) {
  if (!isOkay(loginSuccess)) {
    attemptsCounter++;
  }
}

export { lockout, incrementAttempts, isOkay };

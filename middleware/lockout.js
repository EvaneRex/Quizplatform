import rateLimit from "express-rate-limit";

// lås brugere ud efter 3 mislykkede loginforsøg i 15 minutter (per brugernavn)
const maxAttempts = 3;
const lockoutDuration = 15 * 60 * 1000; // 15 minutter i millisekunder

// struktur: { [username]: { count: number, timer: Timeout | null } }
const attempts = new Map();

// isOkay skal chekke om login er fejlet,
// så incrementAttempts kan øges hvis dette er tilfældet
// loginSucceeded: true hvis login lykkedes, false hvis det fejlede
function isOkay(loginSucceeded) {
  // returnerer true når login er fejlet ("okay" at tælle op)
  return !loginSucceeded;
}

function lockout(req, res, next) {
  const ip = req.ip;

  const userAttempts = attempts.get(ip) || 0;

  if (userAttempts >= maxAttempts) {
    return res
      .status(403)
      .json({ message: "For mange forsøg. Prøv igen senere." });
  }

  next();
}

function incrementAttempts(loginSucceeded, username) {
  if (!loginSucceeded) {
    const current = attempts.get(username) || 0;
    attempts.set(username, current + 1);

    if (current + 1 >= maxAttempts) {
      setTimeout(() => {
        attempts.delete(username);
      }, lockoutDuration);
    }
  }
}

function resetAttempts(username) {
  attempts.delete(username);
}

// function resetAttempts(req) {
//   attempts.delete(req.ip);

//   const entry = attempts[username];
//   if (entry?.timer) {
//     clearTimeout(entry.timer);
//   }

//   delete attempts[username];
// }

const loginLimiter = rateLimit({
  // beskytter mod brute-force login ved at begrænse antal forsøg pr. IP
  windowMs: 15 * 60 * 1000, // 15 minutter
  max: 50, // Er sat til 50 fordi vi testede, men den skal stå på omkring de 5
  standardHeaders: true, // returnerer ratelimitstatus i `RateLimit-*` headers
  legacyHeaders: false,
  message: "For mange loginforsøg, prøv igen om 15 minutter.",
});

export { lockout, incrementAttempts, resetAttempts, isOkay, loginLimiter };

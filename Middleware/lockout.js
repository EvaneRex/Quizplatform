// import rateLimit from "express-rate-limit";

// // // lås brugere ud efter 3 mislykkede loginforsøg i 15 minutter
// // let attemptsCounter = 0;
// // const maxAttempts = 3;
// // const lockoutDuration = 15 * 60 * 1000; // 15 minutter i millisekunder
// // let lockoutTimer = null;

// // isOkay skal chekke om login er fejlet,
// // så incrementAttempts kan øges hvis dette er tilfældet
// // loginSucceeded: true hvis login lykkedes, false hvis det fejlede
// function isOkay(loginSucceeded) {
//   // returnerer true når login er fejlet ("okay" at tælle op)
//   return !loginSucceeded;
// }

// function lockout(req, res, next) {
//   if (attemptsCounter >= maxAttempts) {
//     return res.status(403).json({ message: "Konto låst i 15 minutter." });
//   }
//   next();
// }

// function incrementAttempts(loginSucceeded) {
//   if (isOkay(loginSucceeded)) {
//     attemptsCounter++;

//     // start en 15-minutters timer første gang kontoen låses
//     if (attemptsCounter >= maxAttempts && !lockoutTimer) {
//       lockoutTimer = setTimeout(() => {
//         resetAttempts();
//         lockoutTimer = null;
//       }, lockoutDuration);
//     }
//   }
// }

// function resetAttempts() {
//   attemptsCounter = 0;
// }

// // const loginLimiter = rateLimit({
// //   // beskytter mod brute-force login ved at begrænse antal forsøg pr. IP
// //   windowMs: 15 * 60 * 1000, // 15 minutter
// //   max: 5, // maks 5 loginforsøg pr. IP-adresse inden for 15 minutter
// //   standardHeaders: true, // returnerer ratelimitstatus i `RateLimit-*` headers
// //   legacyHeaders: false,
// //   message: "For mange loginforsøg, prøv igen om 15 minutter.",
// // });

// export { lockout, incrementAttempts, resetAttempts, isOkay, loginLimiter };

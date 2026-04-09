# Projekt Checkliste

## Frontend

- [x] Login-form fungerer
  - [x] Logud - mangler bekræftelse om man er sikker på man vil logge ud
- [x] Oprettelse af bruger
  - [x] tilføje MFA
  - [x] email
- [x] Quiz med radio knap, checkbox og lille input tekst med 10 spørgsmål mindst
- [x] Admin skal kunne se alle brugernes interaktioner med platformen
  - [x] hvem der tager hvilken quiz og hvornår, hvor langt tid det tager dem og resultat
- [x] Brugere skal kunne tage og se tilgængelige quizzer
- [x] Se aktuelle resultater og ALLE tidligere resultater
- [x] Point system
  - [x] brugerne skal informeres om vilkårne enten ved hvert spørgsmål eller i starten af quizzen (tab af point etc)
- [ ] Efter ends quiz skal brugeren have resultaterne vises som basal statestik og se quizzen i sin helhed, og derefter kunne tage en anden

## Server

- [ ] Admin skal kunne slette og uploade quizfiler
  - [ ] Quiz filer skal gemmes som json eller xml, (evt konventering fra andre filer)
- [x] Admin skal have samme rettigheder som brugere og mere (admin rettigheder)
- [x] Tjek af adgangskode styrke
- [x] Passwords skal gemmes sikkert på serveren(gemt som json?)
- [x] Gemme resulater fra brugerne
- [x] Korrekte quiz svar må IKKE være tilgængelige på client før brugeren har svaret
- [ ] Serveren skal løbende holde styr på statestik over brugernes resultater

## Generelle funktioner

- [x] Login skal fungere sikkert
- [x] Adgangskode skal hashes
- [x] Quiz spørgsmål skal have random rækkefølge
- [ ] Quiz filerne skal saniteres, spørgsmål og svar tekst må kun indeholde HTML-tags som skal sendes til klienten
- [x] Quiz skal laves med min. 10 spørgsmål (MANGLER CLOZE)
- [x] Sikre at student ikke kan tilgå admin dashboard
- [x] Ratelimiting (INDEN AFLEVERING RET TIL 5 IGEN FRA 50)
- [ ] Admin og student dashboard skal opsættes i HTML

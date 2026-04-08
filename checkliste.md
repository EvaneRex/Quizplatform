# Projekt Checkliste

## Frontend

- [x] Login-form fungerer
  - [ ] Logud manlger men er gjort klar i server
- [x] Oprettelse af bruger
  - [ ] måske tilføje MFA og email
- [ ] Quiz med radio knap, checkbox og lille input tekst med 10 spørgsmål mindst
- [ ] Admin skal kunne se alle brugernes interaktioner med platformen
  - [ ] hvem der tager hvilken quiz og hvornår, hvor langt tid det tager dem og resultat
- [ ] Brugere skal kunne tage og se tilgængelige quizer
- [ ] Se aktuelle resultater og ALLE tidligere resultater
- [ ] Point system, brugerne skal informeres om vilkårne enten ved hvert spørgsmål eller i starten af quizzen (tab af point etc)
- [ ] Efter ends quiz skal brugeren have resultaterne vises som basal statestik og se quizzen i sin helhed, og derefter kunne tage en anden

## Server

- [ ] Admin skal kunne slette og uploade quizfiler
- [ ] Quiz filer skal gemmes som json eller xml, (evt konventering fra andre filer)
- [x] Admin skal have samme rettigheder som brugere og mere (admin rettigheder)
  - [ ] Mangler at sikre de sidste routes
- [x] Tjek af adgangskode styrke
- [ ] Passwords skal gemmes sikkert på serveren(gemt som json?)
- [ ] Gemme resulater fra brugerne
- [ ] Korrekte quiz svar må IKKE være tilgængelige på client før brugeren har svaret
- [ ] Serveren skal løbende holde styr på statestik over brugernes resultater (måske laves som sin egen fil og lægges i routes mappen, så serveren er "ren")

## Generelle funktioner

- [x] Login skal fungere sikkert
- [x] Adgangskode skal hashes
- [ ] Quiz spørgsmål skal have random rækkefølge
- [ ] Quiz filerne skal saniteres, spørgsmål og svar tekst må kun indeholde HTML-tags som skal sendes til klienten
- [ ] Quiz skal laves med min. 10 spørgsmål
- [x] Sikre at student ikke kan tilgå admin dashboard
- [x] Ratelimiting (INDEN AFLEVERING RET TIL 5 IGEN FRA 50)
- [ ] Admin og student dashboard skal opsættes i HTML

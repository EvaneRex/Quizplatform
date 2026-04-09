export default class Header {
  constructor(headerId, pageTitle) {
    this.header = document.getElementById(headerId);
    this.pageTitle = pageTitle;
    this.render();
    this.loadUser();
  }

  render() {
    this.header.innerHTML = "";

    const userDiv = document.createElement("div");
    userDiv.classList.add("user-info");

    this.usernameSpan = document.createElement("span");
    this.usernameSpan.textContent = "Indlæser...";
    userDiv.appendChild(this.usernameSpan);

    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Log ud";
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        alert("Kunne ikke logge ud");
      }
    });
    userDiv.appendChild(logoutBtn);

    this.header.appendChild(userDiv);
  }

  async loadUser() {
    try {
      const res = await fetch("/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("Ikke logget ind");
      const user = await res.json();
      this.usernameSpan.textContent = user.username;
    } catch (err) {
      console.error(err);
      this.usernameSpan.textContent = "Gæst";
    }
  }
}

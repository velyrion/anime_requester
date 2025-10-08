// Récupérer l'élément du bouton et le body
const themeSwitchButton = document.getElementById("theme-switch");
const body = document.body;

// Vérifier l'état du thème (clair ou sombre) au chargement de la page
const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark") {
    body.classList.add("darkmode");
} else {
    body.classList.remove("darkmode");
}

// Gérer le clic du bouton
themeSwitchButton.addEventListener("click", () => {
    body.classList.toggle("darkmode");
    if (body.classList.contains("darkmode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

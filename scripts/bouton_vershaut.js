const btnvhaut = document.getElementById("scroll-up-btn");

window.addEventListener("scroll", () => {
    if(window.scrollY > 300) {
        btnvhaut.classList.add("show");
    } else {
        btnvhaut.classList.remove("show");
    }
});

btnvhaut.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});
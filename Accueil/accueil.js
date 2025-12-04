(() => {
    const creditsBtn = document.getElementById("credits-btn");
    if (creditsBtn) {
        creditsBtn.addEventListener("click", () => {
            window.location.href = "../Credits/credits.html";
        });
    }
})();

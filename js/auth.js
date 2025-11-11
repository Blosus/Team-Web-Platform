import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "/js/mainConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const msg = document.getElementById("msg");

btnLogin.addEventListener("click", async () => {
    const email = emailEl.value.trim();
    const pass = passEl.value.trim();
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        window.location.href = "/html/admin.html";
    } catch (e) {
        msg.textContent = "Error al iniciar sesión: " + e.message;
    }
});

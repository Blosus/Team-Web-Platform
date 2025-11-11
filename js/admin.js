import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref as dbRef, set, get, child, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, cloudinary } from "/js/mainConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const txtId = document.getElementById("txtId");
const txtNombre = document.getElementById("txtNombre");
const txtCategoria = document.getElementById("txtCategoria");
const txtDescripcion = document.getElementById("txtDescripcion");
const txtIngredientes = document.getElementById("txtIngredientes");
const txtPasos = document.getElementById("txtPasos");
const txtUrl = document.getElementById("txtUrl");
const imageInput = document.getElementById("imageInput");
const uploadButton = document.getElementById("uploadButton");
const btnAgregar = document.getElementById("btnAgregar");
const btnBuscar = document.getElementById("btnBuscar");
const btnActualizar = document.getElementById("btnActualizar");
const btnBorrar = document.getElementById("btnBorrar");
const btnLimpiar = document.getElementById("btnLimpiar");
const mensaje = document.getElementById("mensaje");
const tablaBody = document.querySelector("#tablaRecetas tbody");
const btnLogout = document.getElementById("btnLogout");

function mostrarMensaje(m, c = "black") { mensaje.textContent = m; mensaje.style.color = c; setTimeout(() => mensaje.textContent = "", 2500) }

uploadButton.addEventListener("click", async () => {
    if (imageInput.files.length === 0) { mostrarMensaje("Selecciona una imagen", "red"); return }
    const file = imageInput.files[0];
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", cloudinary.uploadPreset);
    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, { method: "POST", body: fd });
        const data = await res.json();
        txtUrl.value = data.secure_url || "";
        mostrarMensaje("Imagen subida correctamente");
    } catch (e) {
        mostrarMensaje("Error al subir imagen", "red");
    }
});

btnAgregar.addEventListener("click", () => {
    const id = txtId.value.trim();
    if (!id) { mostrarMensaje("Ingresa un ID", "red"); return }
    const data = {
        id,
        nombre: txtNombre.value.trim(),
        categoria: txtCategoria.value.trim(),
        descripcion: txtDescripcion.value.trim(),
        ingredientes: txtIngredientes.value.trim(),
        pasos: txtPasos.value.trim(),
        urlImg: txtUrl.value.trim()
    };
    set(dbRef(db, "Recetas/" + id), data)
        .then(() => { mostrarMensaje("Receta agregada"); listarRecetas() })
        .catch(e => mostrarMensaje("Error: " + e.message, "red"));
});

btnBuscar.addEventListener("click", async () => {
    const id = txtId.value.trim();
    if (!id) { mostrarMensaje("Ingresa un ID", "red"); return }
    const dbR = dbRef(db);
    try {
        const snap = await get(child(dbR, "Recetas/" + id));
        if (snap.exists()) {
            const data = snap.val();
            txtNombre.value = data.nombre || "";
            txtCategoria.value = data.categoria || "";
            txtDescripcion.value = data.descripcion || "";
            txtIngredientes.value = data.ingredientes || "";
            txtPasos.value = data.pasos || "";
            txtUrl.value = data.urlImg || "";
            mostrarMensaje("Receta encontrada");
        } else {
            mostrarMensaje("No existe la receta", "red");
        }
    } catch (e) { mostrarMensaje("Error: " + e.message, "red") }
});

btnActualizar.addEventListener("click", () => {
    const id = txtId.value.trim();
    if (!id) { mostrarMensaje("Ingresa un ID", "red"); return }
    const updates = {
        nombre: txtNombre.value.trim(),
        categoria: txtCategoria.value.trim(),
        descripcion: txtDescripcion.value.trim(),
        ingredientes: txtIngredientes.value.trim(),
        pasos: txtPasos.value.trim(),
        urlImg: txtUrl.value.trim()
    };
    update(dbRef(db, "Recetas/" + id), updates)
        .then(() => { mostrarMensaje("Receta actualizada"); listarRecetas() })
        .catch(e => mostrarMensaje("Error: " + e.message, "red"));
});

btnBorrar.addEventListener("click", () => {
    const id = txtId.value.trim();
    if (!id) { mostrarMensaje("Ingresa un ID", "red"); return }
    remove(dbRef(db, "Recetas/" + id))
        .then(() => { mostrarMensaje("Receta eliminada"); listarRecetas() })
        .catch(e => mostrarMensaje("Error: " + e.message, "red"));
});

btnLimpiar.addEventListener("click", () => {
    txtId.value = ""; txtNombre.value = ""; txtCategoria.value = ""; txtDescripcion.value = "";
    txtIngredientes.value = ""; txtPasos.value = ""; txtUrl.value = "";
});

function listarRecetas() {
    tablaBody.innerHTML = "";
    onValue(dbRef(db, "Recetas"), snapshot => {
        tablaBody.innerHTML = "";
        snapshot.forEach(child => {
            const d = child.val();
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${d.id || child.key}</td><td>${d.nombre || ""}</td><td>${d.categoria || ""}</td><td><img src="${d.urlImg || ''}" width="80"></td>`;
            tablaBody.appendChild(tr);
        });
    }, { onlyOnce: false });
}

onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = "/html/login.html";
    } else {
        listarRecetas();
    }
});

btnLogout.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (e) { }
});

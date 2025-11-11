import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "/js/mainConfig.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const filtro = document.getElementById("filtroCategoria");
const buscar = document.getElementById("buscarNombre");
const grid = document.getElementById("gridRecetas");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const cerrarModal = document.getElementById("cerrarModal");

function crearCard(data) {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
    <img src="${data.urlImg || '/assets/placeholder.png'}" alt="${data.nombre}">
    <div class="body">
      <h3>${data.nombre}</h3>
      <p>${(data.descripcion || "").slice(0, 120)}${(data.descripcion || "").length > 120 ? "..." : ""}</p>
      <div class="meta">Categoria: ${data.categoria || 'General'}</div>
      <a class="btn-detalle" data-id="${data.id}">Más información</a>
    </div>
  `;
    const btn = div.querySelector(".btn-detalle");
    btn.addEventListener("click", () => mostrarDetalle(data));
    return div;
}

function mostrarDetalle(data) {
    modalBody.innerHTML = `
    <h2>${data.nombre}</h2>
    <img style="max-width:100%;height:auto;border-radius:8px;margin-bottom:12px" src="${data.urlImg || '/assets/placeholder.png'}" alt="${data.nombre}">
    <h3>Ingredientes</h3>
    <p>${(data.ingredientes || "").replace(/\n/g, "<br>")}</p>
    <h3>Pasos</h3>
    <p>${(data.pasos || "").replace(/\n/g, "<br>")}</p>
  `;
    modal.style.display = "flex";
}

cerrarModal.addEventListener("click", () => modal.style.display = "none");
modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none" });

const categorias = new Set();
const refRec = ref(db, "Recetas");
onValue(refRec, snapshot => {
    grid.innerHTML = "";
    categorias.clear();
    snapshot.forEach(child => {
        const data = child.val();
        if (!data) return;
        categorias.add(data.categoria || "General");
    });
    filtro.innerHTML = `<option value="todas">Todas las categorías</option>`;
    Array.from(categorias).sort().forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        filtro.appendChild(opt);
    });
    snapshot.forEach(child => {
        const data = child.val();
        if (!data) return;
        const card = crearCard(data);
        grid.appendChild(card);
    });
});

filtro.addEventListener("change", () => {
    const cat = filtro.value;
    const q = buscar.value.trim().toLowerCase();
    grid.innerHTML = "";
    onValue(ref(db, "Recetas"), snapshot => {
        snapshot.forEach(child => {
            const data = child.val();
            if (!data) return;
            if (cat !== "todas" && (data.categoria || "") !== cat) return;
            if (q && !(data.nombre || "").toLowerCase().includes(q)) return;
            grid.appendChild(crearCard(data));
        });
    }, { onlyOnce: true });
});

buscar.addEventListener("input", () => {
    const q = buscar.value.trim().toLowerCase();
    const cat = filtro.value;
    grid.innerHTML = "";
    onValue(ref(db, "Recetas"), snapshot => {
        snapshot.forEach(child => {
            const data = child.val();
            if (!data) return;
            if (cat !== "todas" && (data.categoria || "") !== cat) return;
            if (q && !(data.nombre || "").toLowerCase().includes(q)) return;
            grid.appendChild(crearCard(data));
        });
    }, { onlyOnce: true });
});

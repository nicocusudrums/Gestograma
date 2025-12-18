/* ===== UTILIDADES DE FECHA ===== */
const hoyISO = () => new Date().toISOString().split("T")[0];

function parseISODate(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function sumarDias(fecha, dias) {
    const d = new Date(fecha);
    d.setDate(d.getDate() + dias);
    return d;
}

function diasEntre(a, b) {
    return Math.floor((b - a) / 86400000);
}

function formatearFecha(date) {
    return date.toLocaleDateString("es-AR");
}

/* ===== CÁLCULOS ===== */
function actualizarFPP() {
    const fumStr = document.getElementById("fum").value;
    const fppTexto = document.getElementById("fppTexto");

    if (!fumStr) {
        fppTexto.textContent = "-";
        return;
    }

    const fum = parseISODate(fumStr);
    const fpp = sumarDias(fum, 280);
    fppTexto.textContent = formatearFecha(fpp);
}

function actualizarEG() {
    const fumStr = document.getElementById("fum").value;
    const consultaStr = document.getElementById("fechaConsulta").value;
    const egChip = document.getElementById("egChip");

    if (!fumStr || !consultaStr) {
        egChip.textContent = "-";
        return;
    }

    const fum = parseISODate(fumStr);
    const consulta = parseISODate(consultaStr);
    const diff = diasEntre(fum, consulta);

    if (diff < 0) {
        egChip.textContent = "Antes de FUM";
        return;
    }

    const semanas = Math.floor(diff / 7);
    const dias = diff % 7;

    egChip.textContent = `${semanas} sem + ${dias} días`;
}

/* ===== UI ===== */
function actualizarUI() {
    actualizarFPP();
    actualizarEG();

    localStorage.setItem("fum", fum.value);
    localStorage.setItem("consulta", fechaConsulta.value);
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
    const fum = document.getElementById("fum");
    const fechaConsulta = document.getElementById("fechaConsulta");
    const btnHoy = document.getElementById("btnHoy");
    const btnFpp = document.getElementById("btnFpp");

    fum.value = localStorage.getItem("fum") || "";
    fechaConsulta.value = localStorage.getItem("consulta") || hoyISO();

    fum.addEventListener("change", actualizarUI);
    fechaConsulta.addEventListener("change", actualizarUI);

    btnHoy.onclick = () => {
        fechaConsulta.value = hoyISO();
        actualizarUI();
    };

    btnFpp.onclick = () => {
        if (!fum.value) {
            alert("Ingrese una FUM primero");
            return;
        }
        fechaConsulta.value = sumarDias(parseISODate(fum.value), 280)
            .toISOString().split("T")[0];
        actualizarUI();
    };

    actualizarUI();
});

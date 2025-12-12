/* ========================
   FUNCIONES DE FECHA
   ======================== */
function parseISODate(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
}

const hoyISO = () => new Date().toISOString().split("T")[0];

function sumarDias(fecha, dias) {
    const d = new Date(fecha);
    d.setDate(d.getDate() + dias);
    return d;
}

function formatearFecha(date) {
    if (!(date instanceof Date) || isNaN(date)) return "-";
    return date.toLocaleDateString("es-AR");
}

function diasEntre(a, b) {
    return Math.floor((b - a) / 86400000);
}

/* ========================
   CÁLCULO DE EG
   ======================== */
function calcularEG(fumStr, consultaStr) {
    const egChip = document.getElementById("egChip");
    if (!fumStr || !consultaStr) { egChip.textContent = "-"; return; }

    const fum = parseISODate(fumStr);
    const consulta = parseISODate(consultaStr);

    const diffDias = diasEntre(fum, consulta);
    if (diffDias < 0) { egChip.textContent = "Antes de FUM"; return; }

    const semanas = Math.floor(diffDias / 7);
    const dias = diffDias % 7;

    egChip.textContent = `${semanas} sem + ${dias} d (${diffDias} días)`;
}

/* ========================
   ACTUALIZAR FPP
   ======================== */
function actualizarFpp() {
    const fumStr = document.getElementById("fum").value;
    const fppTexto = document.getElementById("fppTexto");

    if (!fumStr) { fppTexto.textContent = "-"; return; }

    const fum = parseISODate(fumStr);
    const fpp = sumarDias(fum, 280);
    fppTexto.textContent = formatearFecha(fpp);
}

/* ========================
   FUNCION PARA CALCULAR TRIMESTRE
   ======================== */
function trimestrePorSemana(semana) {
    if (semana <= 13) return "1º trimestre";
    if (semana <= 27) return "2º trimestre";
    return "3º trimestre";
}

/* ========================
   DIBUJAR GESTOGRAMA CON TOOLTIP Y ROTACIÓN
   ======================== */
function dibujarGestograma(semanaActual = 0) {
    const svg = document.getElementById("gestograma");
    svg.innerHTML = "";

    const totalSemanas = 40;
    const svgSize = svg.clientWidth;
    const center = svgSize / 2;
    const radius = center - 30;
    const angle = 360 / totalSemanas;

    // Tooltip
    let tooltip = document.getElementById("tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.padding = "6px 10px";
        tooltip.style.background = "rgba(0,0,0,0.8)";
        tooltip.style.color = "#fff";
        tooltip.style.fontSize = "12px";
        tooltip.style.borderRadius = "6px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.transition = "opacity 0.2s";
        tooltip.style.opacity = "0";
        document.body.appendChild(tooltip);
    }

    for (let i = 0; i < totalSemanas; i++) {
        const startAngle = (angle * i - 90) * Math.PI / 180;
        const endAngle = (angle * (i + 1) - 90) * Math.PI / 180;

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);

        const largeArcFlag = angle > 180 ? 1 : 0;
        const pathData = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", "#fff");
        path.setAttribute("stroke-width", "1");

        // Colores
        if (i < semanaActual) path.setAttribute("fill", i % 2 === 0 ? "#64b5f6" : "#f48fb1");
        else if (i === semanaActual) path.setAttribute("fill", i % 2 === 0 ? "#2196f3" : "#ec407a");
        else path.setAttribute("fill", i % 2 === 0 ? "#bbdefb" : "#f8bbd0");

        svg.appendChild(path);

        // Numeración de semanas
        const numSemana = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const textAngle = (startAngle + endAngle) / 2;
        const textRadius = radius - 15;
        const textX = center + textRadius * Math.cos(textAngle);
        const textY = center + textRadius * Math.sin(textAngle);

        numSemana.setAttribute("x", textX);
        numSemana.setAttribute("y", textY);
        numSemana.setAttribute("font-size", "10px");
        numSemana.setAttribute("text-anchor", "middle");
        numSemana.setAttribute("dominant-baseline", "middle");
        numSemana.setAttribute("fill", "#333");
        numSemana.textContent = i + 1;
        svg.appendChild(numSemana);

        // Tooltip
        path.addEventListener("mousemove", (e) => {
            const diaInicio = i * 7 + 1;
            const diaFin = (i + 1) * 7;
            tooltip.innerHTML = `Semana ${i + 1} <br> Días ${diaInicio}-${diaFin} <br> ${trimestrePorSemana(i + 1)}`;
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            tooltip.style.opacity = 1;
        });
        path.addEventListener("mouseleave", () => tooltip.style.opacity = 0);
    }

    // Rotar SVG para centrar la semana actual arriba
    const rotateAngle = -((semanaActual - 1) * angle);
    svg.style.transform = `rotate(${rotateAngle}deg)`;
}

/* ========================
   ACTUALIZAR RUEDA SEGÚN FECHAS
   ======================== */
function actualizarGestograma() {
    const fumStr = document.getElementById("fum").value;
    const consultaStr = document.getElementById("fechaConsulta").value;
    if (!fumStr || !consultaStr) { dibujarGestograma(0); return; }

    const fum = parseISODate(fumStr);
    const consulta = parseISODate(consultaStr);
    const diffDias = diasEntre(fum, consulta);

    const semanaActual = diffDias < 0 ? 0 : Math.min(Math.floor(diffDias / 7), 40);
    dibujarGestograma(semanaActual);
}

/* ========================
   ACTUALIZAR TODA LA UI
   ======================== */
function actualizarUI() {
    actualizarFpp();

    const fumStr = document.getElementById("fum").value;
    const consultaStr = document.getElementById("fechaConsulta").value;

    calcularEG(fumStr, consultaStr);
    actualizarGestograma();

    if (fumStr) localStorage.setItem("fum", fumStr);
    if (consultaStr) localStorage.setItem("consulta", consultaStr);
}

/* ========================
   INICIALIZACIÓN
   ======================== */
document.addEventListener("DOMContentLoaded", () => {
    const fumInput = document.getElementById("fum");
    const fechaConsultaInput = document.getElementById("fechaConsulta");
    const btnHoy = document.getElementById("btnHoy");
    const btnFpp = document.getElementById("btnFpp");

    fumInput.value = localStorage.getItem("fum") || "";
    fechaConsultaInput.value = localStorage.getItem("consulta") || hoyISO();

    fumInput.addEventListener("change", actualizarUI);
    fechaConsultaInput.addEventListener("change", actualizarUI);

    btnHoy.addEventListener("click", () => {
        fechaConsultaInput.value = hoyISO();
        actualizarUI();
    });

    btnFpp.addEventListener("click", () => {
        const fumStr = fumInput.value;
        if (!fumStr) { alert("Debe ingresar una FUM primero."); return; }

        const fppISO = sumarDias(parseISODate(fumStr), 280).toISOString().split("T")[0];
        fechaConsultaInput.value = fppISO;
        actualizarUI();
    });

    actualizarUI();
});

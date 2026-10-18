const botonMorse = document.getElementById("botonMorse");
const secuenciaVista = document.getElementById("secuencia");
const mensajeVista = document.getElementById("mensaje");
const estado = document.getElementById("estado");
const resultado = document.getElementById("resultado");

const botonTerminar = document.getElementById("terminarLetra");
const botonEspacio = document.getElementById("espacio");
const botonBorrarSenal = document.getElementById("borrarSenal");
const botonBorrarTodo = document.getElementById("borrarTodo");
const botonCopiar = document.getElementById("copiar");
const botonEscuchar = document.getElementById("escuchar");

// Diccionario internacional de código Morse.
// Incluye la Ñ utilizada en español.
const morse = {
    ".-": "A",
    "-...": "B",
    "-.-.": "C",
    "-..": "D",
    ".": "E",
    "..-.": "F",
    "--.": "G",
    "....": "H",
    "..": "I",
    ".---": "J",
    "-.-": "K",
    ".-..": "L",
    "--": "M",
    "-.": "N",
    "--.--": "Ñ",
    "---": "O",
    ".--.": "P",
    "--.-": "Q",
    ".-.": "R",
    "...": "S",
    "-": "T",
    "..-": "U",
    "...-": "V",
    ".--": "W",
    "-..-": "X",
    "-.--": "Y",
    "--..": "Z",
    "-----": "0",
    ".----": "1",
    "..---": "2",
    "...--": "3",
    "....-": "4",
    ".....": "5",
    "-....": "6",
    "--...": "7",
    "---..": "8",
    "----.": "9",
    ".-.-.-": ".",
    "--..--": ",",
    "..--..": "?",
    "-.-.--": "!",
    "-..-.": "/"
};

let secuencia = "";
let mensaje = "";
let inicioPulsacion = 0;
let pulsando = false;

// Umbral inicial: a partir de 300 ms se registra una raya.
const DURACION_RAYA = 300;

function actualizarSecuencia() {
    secuenciaVista.textContent =
    secuencia || "Aún no hay señales";
}

function actualizarMensaje() {
    mensajeVista.value = mensaje;
}

function registrarSenal(duracion) {
    const senal = duracion >= DURACION_RAYA ? "-" : ".";

    secuencia += senal;
    actualizarSecuencia();

    estado.textContent =
     senal === "." ? "Punto registrado" : "Raya registrada";

    resultado.textContent = "";
}

// Inicia el registro de una pulsación.
function iniciarPulsacion(evento) {
    if (evento.type === "keydown") {
      if (evento.repeat) return;
        evento.preventDefault();
    }

    if (pulsando) return;

    pulsando = true;
    inicioPulsacion = performance.now();
    estado.textContent = "Registrando señal...";
} 

// Finaliza el registro y decide si fue punto o raya.
function finalizarPulsacion(evento) {
    if (!pulsando) return;

    if (evento && evento.type === "keyup") {
        evento.preventDefault();
    }
     const duracion = performance.now() - inicioPulsacion;
    pulsando = false;

    registrarSenal(duracion);
}

// Compatible con mouse, pantalla táctil y lápiz digital.
botonMorse.addEventListener("pointerdown", (evento) => {
    evento.preventDefault();

    try {
        botonMorse.setPointerCapture(evento.pointerId);
    } catch (_) {
        // Puede no estar disponible en ciertos contextos.
    }

    iniciarPulsacion(evento);
});

botonMorse.addEventListener("pointerup", finalizarPulsacion);
botonMorse.addEventListener("pointercancel", () => {
    pulsando = false;
    estado.textContent = "Pulsación cancelada";
});

// También permite utilizar Enter o la barra espaciadora.
botonMorse.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
        iniciarPulsacion(evento);
    }
});

botonMorse.addEventListener("keyup", (evento) => {
    if (evento.key === "Enter" || evento.key === " ") {
        finalizarPulsacion(evento);
    }
});

// Traduce la secuencia actual y añade una letra al mensaje.
botonTerminar.addEventListener("click", () => {
    if (!secuencia) {
        estado.textContent = "Primero registra una señal.";
        return;
    }

    const letra = morse[secuencia];

    if (letra) {
        mensaje += letra;
        actualizarMensaje();
        estado.textContent = `Letra registrada: ${letra}`;
        secuencia = "";
        actualizarSecuencia();
    } else {
        estado.textContent =
         "Secuencia no reconocida. Puedes corregirla.";
        resultado.textContent =
         "Comprueba los puntos y las rayas antes de continuar.";
    }
});

// Añade un espacio entre palabras.
botonEspacio.addEventListener("click", () => {
    if (secuencia) {
        estado.textContent =
         "Primero termina la letra actual.";
        return;
    }

    if (mensaje && !mensaje.endsWith(" ")) {
        mensaje += " ";
        actualizarMensaje();
        estado.textContent = "Espacio añadido";
    }
});

// Borra la última señal de la letra actual.
botonBorrarSenal.addEventListener("click", () => {
    secuencia = secuencia.slice(0, -1);
    actualizarSecuencia();
    estado.textContent = "Última señal eliminada";
    resultado.textContent = "";
});

// Borra el mensaje y la secuencia.
botonBorrarTodo.addEventListener("click", () => {
    secuencia = "";
    mensaje = "";

    actualizarSecuencia();
    actualizarMensaje();
});

// Copia el mensaje traducido.
botonCopiar.addEventListener("click", async () => {
    if (!mensaje.trim()) {
        resultado.textContent = "Todavía no hay un mensaje.";
        return;
    }

    try {
        await navigator.clipboard.writeText(mensaje);
        resultado.textContent = "Mensaje copiado.";
    } catch (_) {
        // Alternativa si el navegador no permite usar el portapapeles.
        mensajeVista.focus();

        try {
            const copiado = document.execCommand("copy");
            resultado.textContent = copiado
                ? "Mensaje copiado."
                : "Selecciona y copia el texto manualmente.";
        } catch (_) {
            resultado.textContent =
                "Selecciona y copia el texto manualmente.";
        }
    }
});

// Lee el mensaje mediante la voz disponible en el navegador.
botonEscuchar.addEventListener("click", () => {
    if (!mensaje.trim()) {
        resultado.textContent = "Todavía no hay un mensaje.";
        return;
    }

    if (!("speechSynthesis" in window)) {
        resultado.textContent =
            "La lectura de voz no está disponible en este navegador.";
        return;
    }

    window.speechSynthesis.cancel();

    const lectura = new SpeechSynthesisUtterance(mensaje);
    lectura.lang = "es-ES";

    window.speechSynthesis.speak(lectura);
    resultado.textContent = "Reproduciendo el mensaje.";
});
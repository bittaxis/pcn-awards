// ==========================================
// 1. IMPORTACIONES (CORREGIDAS Y UNIFICADAS)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import confetti from "https://cdn.skypack.dev/canvas-confetti";

// ==========================================
// 2. CONFIGURACIÓN FIREBASE (TUS DATOS REALES)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAiDpbCzZs-bokiEbEfAWaOQh6pFdfHL08",
    authDomain: "pcn-awards.firebaseapp.com",
    projectId: "pcn-awards",
    storageBucket: "pcn-awards.firebasestorage.app",
    messagingSenderId: "672093795400",
    appId: "1:672093795400:web:92fb1285e11742a17d947d",
    measurementId: "G-WB7T3BE4BP"
};

// Inicializamos la App y la Base de Datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 3. DATOS DE PREGUNTAS
// ==========================================
const SECCIONES = [
    {
        nombre: "Docentes y Ayudantes",
        preguntas: [
            { titulo: "La mejor guerrera versión docente" },
            { titulo: "Peores PPTs de la historia" },
            { titulo: "El Ayudante Legendario" },
            { titulo: "Ayudante... ¿de verdad ayuda?" },
            { titulo: "Premio 'Frase para el Bronce'" },
            { titulo: "El Rey/Reina del 'Visto'" }
        ]
    },
    {
        nombre: "Vida Académica",
        preguntas: [
            { titulo: "Mejor Guerrero/a de la carrera" },
            { titulo: "La Remontada Épica" },
            { titulo: "Ramo Relleno" },
            { titulo: "Ramo rompe-almas" },
            { titulo: "Laboratorio del Terror" },
            { titulo: "La Librería Ambulante" }
        ]
    },
    {
        nombre: "Personalidades del Grupo",
        preguntas: [
            { titulo: "Cerebro del grupo" },
            { titulo: "Influencer del grupo" },
            { titulo: "Drama King/Queen" },
            { titulo: "Comediante Oficial" },
            { titulo: "Estilo Impecable" },
            { titulo: "El o la más Borracho/cha" },
            { titulo: "Reloj Mal Ajustado" },
            { titulo: "El Fantasma" },
            { titulo: "Aprobó de Milagro" },
            { titulo: "Dios del PowerPoint" },
            { titulo: "Dúo o Trío Dinámico" },
            { titulo: "La Mamá/Papá del Grupo" },
            { titulo: "Premio 'Ya voy llegando'" },
            { titulo: "La Risa del Año" }
        ]
    },
    {
        nombre: "Anécdotas y Memorias",
        preguntas: [
            { titulo: "Nicosas (Momentos Nico)" },
            { titulo: "Peor actividad Explora" },
            { titulo: "Salida memorable" },
            { titulo: "La Disertación Eterna" },
            { titulo: "La Crisis Colectiva" },
            { titulo: "El Rojo Colectivo" }
        ]
    }
];

// GENERADOR DE IDs
let contadorGlobal = 1;
let TOTAL_PREGUNTAS = 0;
SECCIONES.forEach(seccion => {
    seccion.preguntas.forEach(pregunta => {
        pregunta.id = `p${contadorGlobal}`;
        contadorGlobal++;
        TOTAL_PREGUNTAS++;
    });
});

// ==========================================
// 4. RENDERIZADO (TARJETAS)
// ==========================================
const scrollTrack = document.getElementById('scrollTrack');
const puntosContainer = document.getElementById('puntosContainer');
const contentLayer = document.getElementById('contentLayer');
const timelineLayer = document.getElementById('timelineLayer'); 

const ALTURA_HERO = 1000; 
const ALTURA_PER_SECCION = 2500; 
const ALTURA_TOTAL = ALTURA_HERO + (SECCIONES.length * ALTURA_PER_SECCION) + 1000;

if(scrollTrack) scrollTrack.style.height = `${ALTURA_TOTAL}px`;

SECCIONES.forEach((seccion, index) => {
    const punto = document.createElement('div');
    punto.className = 'punto-nodo';
    punto.id = `punto-${index}`; 
    punto.innerHTML = `<div class="label-nodo ${index % 2 === 0 ? 'label-top' : 'label-bottom'}">${seccion.nombre}</div>`;
    puntosContainer.appendChild(punto);

    const card = document.createElement('div');
    card.className = 'seccion-detalle';
    card.id = `card-content-${index}`;
    
    let htmlContent = `<h2 style="color:var(--gold); margin-bottom:30px; font-family:'Playfair Display', serif;">${seccion.nombre}</h2>`;
    seccion.preguntas.forEach(preg => {
        htmlContent += `
            <div style="margin-bottom:40px; text-align:left;">
                <h3 style="font-size:1.1rem; color:#eee; margin-bottom:15px;">${preg.titulo}</h3>
                <input type="text" 
                       class="input-voto-libre" 
                       placeholder="Escribe tu respuesta..." 
                       oninput="window.registrarVoto('${preg.id}', this.value)"
                       autocomplete="off">
            </div>
        `;
    });
    card.innerHTML = htmlContent;
    contentLayer.appendChild(card);
});

// ==========================================
// 5. LÓGICA VOTOS
// ==========================================
let misVotos = {};

window.registrarVoto = (idPregunta, valorTexto) => {
    const valorLimpio = valorTexto.trim();
    if (valorLimpio.length > 0) {
        misVotos[idPregunta] = valorLimpio;
    } else {
        delete misVotos[idPregunta];
    }
    if(document.getElementById('footerLayer').classList.contains('active')) {
        generarResumen();
    }
};

function generarResumen() {
    const contenedorResumen = document.getElementById('resumenContainer');
    const btnEnviar = document.getElementById('btnEnviar');
    const mensajeEstado = document.getElementById('mensajeEstado');
    
    let htmlResumen = '';
    let preguntasRespondidas = 0;

    SECCIONES.forEach((seccion, indexSeccion) => {
        htmlResumen += `<div style="color:var(--gold-dim); font-size:0.8rem; text-transform:uppercase; margin-top:15px; margin-bottom:5px; font-weight:bold;">${seccion.nombre}</div>`;
        seccion.preguntas.forEach(preg => {
            const respuesta = misVotos[preg.id];
            let claseEstado = '';
            let textoRespuesta = '';
            if (respuesta) {
                preguntasRespondidas++;
                textoRespuesta = respuesta;
            } else {
                claseEstado = 'falta-voto';
                textoRespuesta = '✖ Sin responder';
            }
            htmlResumen += `
                <div class="resumen-item" onclick="window.irASeccion(${indexSeccion})">
                    <span class="resumen-pregunta">${preg.titulo}</span>
                    <span class="resumen-respuesta ${claseEstado}" style="max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${textoRespuesta}</span>
                </div>
            `;
        });
    });
    contenedorResumen.innerHTML = htmlResumen;

    if (preguntasRespondidas === TOTAL_PREGUNTAS) {
        btnEnviar.classList.remove('disabled');
        mensajeEstado.textContent = "✨ Acta completa. Lista para enviar. ✨";
        mensajeEstado.className = "status-text ready";
    } else {
        btnEnviar.classList.add('disabled');
        mensajeEstado.textContent = `Faltan ${TOTAL_PREGUNTAS - preguntasRespondidas} respuestas.`;
        mensajeEstado.className = "status-text";
    }
}

window.irASeccion = (index) => {
    const targetY = ALTURA_HERO + (index * ALTURA_PER_SECCION) + (ALTURA_PER_SECCION / 2);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
};

// ==========================================
// 6. ANIMACIÓN SCROLL
// ==========================================
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroLayer = document.getElementById('heroLayer');
    const footerLayer = document.getElementById('footerLayer');
    const btnVolver = document.getElementById('btnVolverResumen');

    if (scrollY < ALTURA_HERO) {
        const progresoHero = scrollY / ALTURA_HERO; 
        heroLayer.style.opacity = 1 - (progresoHero * 1.5);
        heroLayer.style.transform = `scale(${1 - (progresoHero * 0.2)})`;
        heroLayer.style.pointerEvents = (progresoHero > 0.8) ? 'none' : 'auto';
        timelineLayer.style.opacity = Math.max(0, (progresoHero - 0.5) * 2);
        timelineLayer.style.transform = `scale(1)`;
        ocultarTodasLasTarjetas();
        btnVolver.classList.remove('visible'); 
        return; 
    }
    heroLayer.style.opacity = 0;
    heroLayer.style.pointerEvents = 'none';

    const scrollRelativo = scrollY - ALTURA_HERO;
    const indiceFloat = scrollRelativo / ALTURA_PER_SECCION; 
    const seccionActual = Math.floor(indiceFloat);
    const progresoSeccion = indiceFloat - seccionActual; 
    
    if (seccionActual >= SECCIONES.length) {
        timelineLayer.style.opacity = 0;
        ocultarTodasLasTarjetas();
        if (!footerLayer.classList.contains('active')) {
            footerLayer.classList.add('active');
            generarResumen(); 
        }
        btnVolver.classList.remove('visible'); 
        return;
    } else {
        footerLayer.classList.remove('active');
    }

    const cardActual = document.getElementById(`card-content-${seccionActual}`);
    const puntoActual = document.getElementById(`punto-${seccionActual}`);
    ocultarOtrasTarjetas(seccionActual);

    if (puntoActual) {
        const wrapper = document.getElementById('puntosContainer');
        const puntoX = puntoActual.offsetLeft + (puntoActual.offsetWidth / 2) + wrapper.offsetLeft;
        const puntoY = wrapper.offsetTop + (wrapper.offsetHeight / 2);
        timelineLayer.style.transformOrigin = `${puntoX}px ${puntoY}px`;
        const activo = (progresoSeccion > 0.1 && progresoSeccion < 0.9);
        puntoActual.style.background = activo ? '#fff' : '#000';
        puntoActual.style.transform = activo ? 'scale(1.5)' : 'scale(1)';
    }

    if (progresoSeccion < 0.25) {
        const zoom = 1 + (progresoSeccion * 12); 
        timelineLayer.style.transform = `scale(${zoom})`;
        timelineLayer.style.opacity = 1 - (progresoSeccion * 4);
        cardActual.classList.remove('visible'); 
    } else if (progresoSeccion >= 0.25 && progresoSeccion < 0.75) {
        timelineLayer.style.opacity = 0; 
        contentLayer.classList.add('active'); 
        cardActual.classList.add('visible');  
    } else {
        cardActual.classList.remove('visible');
        contentLayer.classList.remove('active');
        const progresoSalida = (progresoSeccion - 0.75) * 4; 
        const zoom = 4 - (progresoSalida * 3); 
        timelineLayer.style.transform = `scale(${zoom})`;
        timelineLayer.style.opacity = progresoSalida;
    }
});

function ocultarTodasLasTarjetas() {
    const cards = document.querySelectorAll('.seccion-detalle');
    cards.forEach(c => c.classList.remove('visible'));
    const content = document.getElementById('contentLayer');
    if(content) content.classList.remove('active');
}

function ocultarOtrasTarjetas(indiceActual) {
    const cards = document.querySelectorAll('.seccion-detalle');
    cards.forEach((c, index) => {
        if (index !== indiceActual) c.classList.remove('visible');
    });
}

document.getElementById('btnVolverResumen').addEventListener('click', () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

// ==========================================
// 7. BOTÓN ENVIAR (¡REAL!)
// ==========================================
document.getElementById('btnEnviar').addEventListener('click', async () => {
    if (Object.keys(misVotos).length < TOTAL_PREGUNTAS) return alert("¡Te faltan preguntas por responder!");
    
    const nombreInput = document.getElementById('nombreUsuario');
    const nombreValido = nombreInput.value.trim() || "Anónimo";
    
    if (!nombreInput.value.trim()) {
        alert("¡Falta tu nombre al inicio! 🎤");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        nombreInput.focus();
        nombreInput.style.borderColor = "red";
        setTimeout(() => nombreInput.style.borderColor = "var(--gold)", 2000);
        return;
    }

    const btn = document.getElementById('btnEnviar');
    const textoOriginalBtn = btn.innerText;
    btn.innerText = "Guardando...";
    btn.classList.add('disabled');

    try {
        // --- GUARDADO EN FIREBASE ---
        await addDoc(collection(db, "votos"), {
             nombre: nombreValido,
             respuestas: misVotos,
             fecha: serverTimestamp(),
             navegador: navigator.userAgent
        });
        
        console.log("¡Voto guardado exitosamente!"); 

        // --- ANIMACIÓN ---
        const overlay = document.getElementById('celebrationOverlay');
        const nameSpan = document.getElementById('celebrationName');
        const msgFinalizar = document.getElementById('msgFinalizar');
        
        nameSpan.innerText = nombreValido;
        overlay.classList.add('active');

        let keepRaining = true;
        const duration = 60 * 1000; 
        const animationEnd = Date.now() + duration;
        const colors = ['#d4af37', '#ffffff', '#FFD700', '#eeeeee'];

        (function frame() {
            if (!keepRaining) return;
            confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0, y: 0.1 }, colors: colors, zIndex: 20001, gravity: 1.2, scalar: 1.2 });
            confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1, y: 0.1 }, colors: colors, zIndex: 20001, gravity: 1.2, scalar: 1.2 });
            if (Date.now() < animationEnd) requestAnimationFrame(frame);
        }());

        setTimeout(() => {
            msgFinalizar.classList.add('visible');
            const finalizarFn = () => {
                keepRaining = false; 
                document.body.classList.add('modo-salida');
                const audio = document.getElementById('audioFondo');
                if (audio && !audio.paused) {
                    const fadeAudioInterval = setInterval(() => {
                        if (audio.volume > 0.05) audio.volume -= 0.05;
                        else { audio.volume = 0; audio.pause(); clearInterval(fadeAudioInterval); }
                    }, 100);
                }
                setTimeout(() => { window.scrollTo(0, 0); window.location.reload(); }, 3000); 
            };
            document.addEventListener('click', finalizarFn, { once: true });
            document.addEventListener('touchstart', finalizarFn, { once: true });
        }, 4000); 

    } catch (error) {
        console.error("FIREBASE ERROR:", error);
        alert("Error: " + error.message);
        btn.innerText = textoOriginalBtn;
        btn.classList.remove('disabled');
    }
});

// ==========================================
// 8. GENERAR PDF
// ==========================================
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
    const nombreUsuario = document.getElementById('nombreUsuario').value || "Anónimo";
    const btn = document.getElementById('btnDescargarPDF');
    btn.innerText = "⏳ Preparando...";

    let filasHTML = '';
    SECCIONES.forEach(seccion => {
        filasHTML += `<div class="pdf-seccion-title">${seccion.nombre}</div>`;
        seccion.preguntas.forEach(preg => {
            const respuesta = misVotos[preg.id] || "__________";
            filasHTML += `
            <div class="pdf-row">
                <div class="pdf-col-pregunta">${preg.titulo}</div>
                <div class="pdf-col-respuesta">${respuesta}</div>
                <div class="pdf-col-check"><div class="pdf-check-box"></div></div>
            </div>`;
        });
    });

    const htmlContenido = `
    <html>
    <head>
        <title>Cartilla PCN - ${nombreUsuario}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
            body { margin: 0; padding: 0; background-color: #080808; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
            .pdf-wrapper { width: 100%; max-width: 800px; margin: 0 auto; background: #080808; color: white; padding: 40px; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 2px solid #d4af37; margin-bottom: 20px; padding-bottom: 10px; }
            .header h1 { color: #d4af37; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; text-transform: uppercase; }
            .header h2 { font-size: 16px; margin-top: 10px; font-weight: normal; }
            .pdf-seccion-title { background: #1a1a1a; color: #d4af37; padding: 8px 10px; margin-top: 15px; font-size: 14px; border-left: 4px solid #d4af37; font-weight: bold; text-transform: uppercase; }
            .pdf-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding: 8px 0; font-size: 11px; }
            .pdf-col-pregunta { flex: 3; color: #ccc; text-align: left; padding-right: 10px; }
            .pdf-col-respuesta { flex: 2; color: #fff; font-weight: bold; text-align: center; }
            .pdf-col-check { width: 40px; display: flex; justify-content: flex-end; }
            .pdf-check-box { width: 20px; height: 20px; background: white; border: 2px solid #d4af37; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #666; border-top: 1px solid #333; padding-top: 10px; }
        </style>
    </head>
    <body>
        <div id="element-to-print" class="pdf-wrapper">
            <div class="header">
                <h1>PCN Awards</h1>
                <p style="color:#aaa; font-size:10px; letter-spacing:2px; margin-top:5px;">CARTILLA OFICIAL DE PREDICCIONES</p>
                <h2>Nombre: ${nombreUsuario}</h2>
            </div>
            ${filasHTML}
            <div class="footer"><p>Ceremonia de Pedagogía en Ciencias Naturales</p></div>
        </div>
        <script>
            window.onload = function() {
                const element = document.getElementById('element-to-print');
                const opt = { margin: 0.2, filename: 'Cartilla_PCN_${nombreUsuario}.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, scrollY: 0, backgroundColor: '#080808' }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
                html2pdf().set(opt).from(element).save().then(() => { setTimeout(() => { window.close(); }, 2000); });
            };
        </script>
    </body>
    </html>
    `;
    const win = window.open('', '_blank', 'width=900,height=800');
    win.document.write(htmlContenido);
    win.document.close();
    btn.innerText = "📄 Descargar Cartilla";
});

// ==========================================
// 9. CONTROL DE MÚSICA
// ==========================================
const audio = document.getElementById('audioFondo');
const btnMusica = document.getElementById('btnMusica');
let musicaIniciada = false;

if(btnMusica && audio) {
    btnMusica.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            btnMusica.innerText = "💿";
            btnMusica.classList.add('musica-sonando');
            musicaIniciada = true;
        } else {
            audio.pause();
            btnMusica.innerText = "🔇";
            btnMusica.classList.remove('musica-sonando');
        }
    });
    document.body.addEventListener('click', () => {
        if (!musicaIniciada) {
            audio.play().then(() => {
                btnMusica.innerText = "💿";
                btnMusica.classList.add('musica-sonando');
                musicaIniciada = true;
            }).catch(() => {});
        }
    }, { once: true });
}

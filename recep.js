import { database } from "./firebase.js";
import { ref, onChildAdded, remove, onChildRemoved, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

// Contador para colores secuenciales
let contadorPedidos = 0;
const pedidosMostrados = new Set();
const audioNotificacion = new Audio('../Notificacion.mp3');
audioNotificacion.preload = 'auto';
let audioHabilitado = false;



function habilitarAudioNotificaciones() {
    if (audioHabilitado) return;

    audioNotificacion.muted = true;
    const reproduccion = audioNotificacion.play();

    if (reproduccion) {
        reproduccion.then(() => {
            audioNotificacion.pause();
            audioNotificacion.currentTime = 0;
            audioNotificacion.muted = false;
            audioHabilitado = true;
        }).catch(() => {
            audioNotificacion.muted = false;
        });
    }
}

function reproducirNotificacion() {
    audioNotificacion.currentTime = 0;
    const reproduccion = audioNotificacion.play();
    if (reproduccion) {
        reproduccion.catch(() => {});
    }
}

function obtenerClaveDiaLocal() {
    const fecha = new Date();
    const opciones = { timeZone: 'America/Costa_Rica', year: 'numeric', month: '2-digit', day: '2-digit' };
    const partesFecha = fecha.toLocaleDateString('es-CR', opciones).split('/');
    return `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
}



// Bloquear el botón de retroceso
history.pushState(null, null, location.href);
window.onpopstate = function () {
    history.go(1);
};

async function iniciarEscuchaPedidos() {
    const pedidosRef = ref(database, 'Orotina/' + 'pedidosEnProceso');

    const snapshotInicial = await get(pedidosRef);
    snapshotInicial.forEach((snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;


        if (pedido && pedido.Items && !pedidosMostrados.has(pedidoId)) {
            pedidosMostrados.add(pedidoId);
            crearTablaPedido(pedido, pedidoId);
        }
    });
    
    onChildAdded(pedidosRef, (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        

        if (pedido && pedido.Items && !pedidosMostrados.has(pedidoId)) {
            pedidosMostrados.add(pedidoId);
            crearTablaPedido(pedido, pedidoId);
            reproducirNotificacion();
        }
    });

    onChildRemoved(pedidosRef, (snapshot) => {
        const pedidoId = snapshot.key;
        pedidosMostrados.delete(pedidoId);
        const elementoPedido = document.querySelector(`.nuevoPedido[data-id="${pedidoId}"]`);
        if (elementoPedido) {
            elementoPedido.remove();
        }
    });
}

function actualizarContador() {
    const el = document.getElementById('contadorPedidos');
    if (el) el.textContent = contadorPedidos;
}
function escogerSiguienteColor() {
    const colores = ['#2ecc71', '#3498db', '#eab5ff', '#f1c40f','#1abc9c', 'rgb(173, 214, 255)'];
    return colores[contadorPedidos % colores.length];
}

function crearTablaPedido(pedido, id) {
    contadorPedidos++;
    actualizarContador();
    const contenedor = document.getElementById('contenedorPedidos');

    // Crear contenedor para este pedido
    const divPedido = document.createElement('div');
    divPedido.className = 'nuevoPedido';
    divPedido.dataset.id = id;

    // Encabezado del pedido
    const origenColor = '#2980b9';
    let htmlContent = `
        <div class="pedido-header">
            <h2>${pedido.Cliente || ''} - Pedido #${contadorPedidos}</h2>
            <h3 style="color: red;">${pedido.Tipo || ''}</h3>
            <h3 style="color: ${origenColor}; font-size: 1.3em;"> ${pedido.Origen ? '---- ' + pedido.Origen + ' ----' : ''} </h3>
        </div>
        <table class="tablaPedido" border="1">
            <thead class="tablaEncabezado" id="tablaEncabezado" style="background-color: ${escogerSiguienteColor()};">
                <tr>
                    <th>Cantidad</th>
                    <th>Bebida</th>
                    <th>Leche</th>
                    <th>Saborizante</th>
                    <th class="encabezadoNota">Nota</th>
                </tr>
            </thead>
            <tbody>
    `;


    // Filas de productos
    pedido.Items.forEach(item => {

        htmlContent += `
            <tr>
                <td>${item.cantidad || 1}</td>
                <td>${item.bebida || '-'}</td>
                <td>${item.leche || '-'}</td>
                <td>${item.saborizante || '-'}</td>
                <td>${item.notaEspecifica || '-'}</td>
            </tr>
        `;
    });

    htmlContent += `
            </tbody>
        </table>
        <p class="notaPedido">${pedido.Nota || ''}</p>
        <button class="btnListo" onclick="completarPedido(this)">
            Listoo!
        </button>
    `;

    divPedido.innerHTML = htmlContent;
    
    // Insertar al final tipo fila india
    contenedor.appendChild(divPedido);
}

window.completarPedido = async function(boton) {
    const contenedorPedido = boton.closest('.nuevoPedido');
    const pedidoId = contenedorPedido.dataset.id;
    const pedidoRef = ref(database, 'Orotina/' + 'pedidosEnProceso/' + pedidoId);
    const snapshot = await get(pedidoRef);
    if (snapshot.exists()) {
        const pedidoData = snapshot.val();
        const numeroProductosVendidos = Array.isArray(pedidoData.Items)
            ? pedidoData.Items.reduce((total, item) => {
                const cantidad = Number(item?.cantidad);
                return total + (Number.isFinite(cantidad) && cantidad > 0 ? cantidad : 1);
            }, 0)
            : 0;

        pedidoData.numeroProductosVendidos = numeroProductosVendidos;

        const diaClave = obtenerClaveDiaLocal();
        const acumuladoPath = `Orotina/estadisticas_ventas/${diaClave}`;
        const acumuladoRef = ref(database, acumuladoPath);

        await runTransaction(acumuladoRef, (actual) => {
            const estadoActual = actual || {};
            return {
                productosVendidos: (Number(estadoActual.productosVendidos) || 0) + numeroProductosVendidos,
                pedidosCompletados: (Number(estadoActual.pedidosCompletados) || 0) + 1,
                ultimaActualizacion: new Date().toLocaleString('sv-SE', { timeZone: 'America/Costa_Rica' })
            };
        });

        const completadoRef = ref(database, 'Orotina/' + 'pedidosCompletados/' + diaClave + '/' + pedidoId);
        await set(completadoRef, pedidoData);
    }
    remove(pedidoRef);
}



// Cargar al inicio
document.addEventListener('DOMContentLoaded', iniciarEscuchaPedidos);
document.addEventListener('click', habilitarAudioNotificaciones, { passive: true });
document.addEventListener('keydown', habilitarAudioNotificaciones);
document.addEventListener('touchstart', habilitarAudioNotificaciones, { passive: true });
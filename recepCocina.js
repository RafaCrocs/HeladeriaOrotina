import { database } from "./firebase.js";
import { ref, onChildAdded, remove, onChildRemoved, get, set, runTransaction } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

let contadorPedidos = 0;
const pedidosMostrados = new Set();
const timersActivos = new Map();
const audioNotificacion = new Audio('Notificacion.mp3');
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
    const pedidosRef = ref(database, 'Orotina/Cocina/PedidosEnProceso');

    const snapshotInicial = await get(pedidosRef);
    snapshotInicial.forEach((snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;

        if (pedido && pedido.Pedidos && !pedidosMostrados.has(pedidoId)) {
            pedidosMostrados.add(pedidoId);
            crearTablaPedido(pedido, pedidoId);
        }
    });

    onChildAdded(pedidosRef, (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;

        if (pedido && pedido.Pedidos && !pedidosMostrados.has(pedidoId)) {
            pedidosMostrados.add(pedidoId);
            crearTablaPedido(pedido, pedidoId);
            reproducirNotificacion();
        }
    });

    onChildRemoved(pedidosRef, (snapshot) => {
        const pedidoId = snapshot.key;
        pedidosMostrados.delete(pedidoId);
        detenerTimerPedido(pedidoId);
        const elementoPedido = document.querySelector(`.nuevoPedido[data-id="${pedidoId}"]`);
        if (elementoPedido) {
            elementoPedido.remove();
        }
    });
}

function iniciarTimerPedido(pedidoId, elementoTiempo) {
    const inicio = Date.now();
    const intervalo = setInterval(() => {
        const transcurrido = Date.now() - inicio;
        const minutos = Math.floor((transcurrido % 3600000) / 60000).toString().padStart(2, '0');
        const segundos = Math.floor((transcurrido % 60000) / 1000).toString().padStart(2, '0');
        elementoTiempo.textContent = `${minutos}:${segundos}`;
    }, 1000);
    timersActivos.set(pedidoId, intervalo);
}

function detenerTimerPedido(pedidoId) {
    const intervalo = timersActivos.get(pedidoId);
    if (intervalo) {
        clearInterval(intervalo);
        timersActivos.delete(pedidoId);
    }
}

function escogerSiguienteColor() {
    const colores = ['#2ecc71', '#3498db', '#eab5ff', '#f1c40f', '#1abc9c', 'rgb(173, 214, 255)'];
    return colores[contadorPedidos % colores.length];
}

function crearTablaPedido(pedido, id) {
    contadorPedidos++;
    const contenedor = document.getElementById('contenedorPedidos');

    const divPedido = document.createElement('div');
    divPedido.className = 'nuevoPedido';
    divPedido.dataset.id = id;
    if(pedido.Origen === 'Restaurante') {
        pedido.Origen = null
    }

    let htmlContent = `
        <div class="pedido-header">
            <h2 class="tiempo" data-timer="${id}">00:00</h2>
            <h2 class="pedido-numero">Pedido #${pedido.Numero || contadorPedidos}</h2>
            <h2 class="pedido-origen">${pedido.Origen || ''}</h2>
        </div>
        <table class="tablaPedido" border="1">
            <thead class="tablaEncabezado" style="background-color: ${escogerSiguienteColor()};">
                <tr>
                    <th>Cant</th>
                    <th>Producto</th>
                    <th>Extras</th>
                </tr>
            </thead>
            <tbody>
    `;

    pedido.Pedidos.forEach(item => {
        const extras = Array.isArray(item.Extra) && item.Extra.length > 0
            ? item.Extra.join(', ')
            : 'Sin extras';
        htmlContent += `
            <tr>
                <td>${item.Cantidad || 1}</td>
                <td>${item.PedidoPrincipal || '-'}</td>
                <td>${extras}</td>
            </tr>
        `;
    });

    htmlContent += `
            </tbody>
        </table>
        ${pedido.Nota ? `<p class="notaPedido"> Nota: ${pedido.Nota}</p>` : ''}
        <button class="btnListo" onclick="completarPedido(this)">
            Listoo!
        </button>
    `;

    divPedido.innerHTML = htmlContent;
    contenedor.appendChild(divPedido);

    const elementoTiempo = divPedido.querySelector(`[data-timer="${id}"]`);
    if (elementoTiempo) {
        iniciarTimerPedido(id, elementoTiempo);
    }
}

window.completarPedido = async function(boton) {
    const contenedorPedido = boton.closest('.nuevoPedido');
    const pedidoId = contenedorPedido.dataset.id;
    const pedidoRef = ref(database, 'Orotina/Cocina/PedidosEnProceso/' + pedidoId);

    const snapshot = await get(pedidoRef);
    if (snapshot.exists()) {
        const pedidoData = snapshot.val();
        const numeroProductosVendidos = Array.isArray(pedidoData.Pedidos)
            ? pedidoData.Pedidos.length
            : 0;

        pedidoData.numeroProductosVendidos = numeroProductosVendidos;

        const diaClave = obtenerClaveDiaLocal();
        const acumuladoRef = ref(database, `Orotina/Cocina/estadisticas_ventas/${diaClave}`);

        await runTransaction(acumuladoRef, (actual) => {
            const estadoActual = actual || {};
            return {
                productosVendidos: (Number(estadoActual.productosVendidos) || 0) + numeroProductosVendidos,
                pedidosCompletados: (Number(estadoActual.pedidosCompletados) || 0) + 1,
                ultimaActualizacion: new Date().toLocaleString('sv-SE', { timeZone: 'America/Costa_Rica' })
            };
        });

        const completadoRef = ref(database, `Orotina/Cocina/pedidosCompletados/${diaClave}/${pedidoId}`);
        await set(completadoRef, pedidoData);
    }

    detenerTimerPedido(pedidoId);
    remove(pedidoRef);
};

// Cargar al inicio
document.addEventListener('DOMContentLoaded', iniciarEscuchaPedidos);
document.addEventListener('click', habilitarAudioNotificaciones, { passive: true });
document.addEventListener('keydown', habilitarAudioNotificaciones);
document.addEventListener('touchstart', habilitarAudioNotificaciones, { passive: true });

window.verHistorial = async function() {
    const diaClave = obtenerClaveDiaLocal();
    const completadosRef = ref(database, `Orotina/Cocina/pedidosCompletados/${diaClave}`);
    const snapshot = await get(completadosRef);

    const pedidos = [];
    snapshot.forEach((child) => {
        pedidos.push({ id: child.key, ...child.val() });
    });

    const ultimos10 = pedidos.slice(-10).reverse();
    const contenedor = document.getElementById('tablaContentHistorial');

    if (ultimos10.length === 0) {
        contenedor.innerHTML = '<p style="padding:20px;color:#555;">No hay pedidos completados hoy.</p>';
    } else {
        contenedor.innerHTML = ultimos10.map((pedido, index) => {
            const filas = Array.isArray(pedido.Pedidos)
                ? pedido.Pedidos.map(item => {
                    const extras = Array.isArray(item.Extra) && item.Extra.length > 0
                        ? item.Extra.join(', ')
                        : 'Sin extras';
                    return `<tr>
                                <td>${pedido.Origen || ""}</td>
                                <td>${item.Cantidad || 1}</td>
                                <td>${item.PedidoPrincipal || '-'}</td>
                                <td>${extras}</td>
                            </tr>`;
                }).join('')
                : '';

            return `
                <div style="margin-bottom:16px; border:1px solid #ccc; padding:8px;">
                    <p><strong>Numero de Pedido: ${pedido.Numero || '-'}</strong> &nbsp; Hora: ${pedido.Hora || '-'}</p>
                    <table class="tablaPedido" border="1">
                        <thead class="tablaEncabezado" style="background-color:#ddd;">
                            <tr>
                                <th>Origen</th>
                                <th>Cant</th>
                                <th>Producto</th>
                                <th>Extras</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
            `;
        }).join('');
    }

    document.getElementById('mostrarHistorial').style.display = 'flex';
};

window.cerrarHistorial = function() {
    document.getElementById('mostrarHistorial').style.display = 'none';
};
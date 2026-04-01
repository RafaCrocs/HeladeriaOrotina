import { database, ref, set, push } from "./firebase.js";

function renderProductos(productos, contenedor) {
    const section = document.getElementById(contenedor);
    section.innerHTML = productos.map(p => `
        <label class="caja" for="${p.imagen}">
            <p class="nombreProductos">${p.nombre}</p>
            <div class="imagenPedido ${p.imagen}"></div>
            <button class="btnAgregar" id="${p.imagen}" onclick="agregarCafe('${p.nombre}')">AGREGAR</button>
        </label>
        `
        
    ).join('');
}

function renderBatidos(productos, contenedor = "contenedorBatidos") {
    const section = document.getElementById(contenedor);
    section.innerHTML = productos.map(p => `
        <label class="caja">
            <p class="nombreProductos">${p.nombre}</p>
            <div class="imagenPedido ${p.nombre}"></div>
            <input type="checkbox" class="checkbox-batido" value="${p.nombre}">
        </label>
        `
    ).join('');
}

function renderFrio(productos, contenedor) {
    const section = document.getElementById(contenedor);
    section.innerHTML = productos.map(p => `
        <label class="caja" for="${p.imagen}">
            <p class="nombreProductos">${p.nombre}</p>
            <div class="imagenPedido ${p.imagen}"></div>
            <button class="btnAgregar" id="${p.imagen}" onclick="agregarFrio('${p.nombre}')">AGREGAR</button>
        </label>
        `
    ).join('');
}

function renderEspeciales(productos, contenedor) {
    const section = document.getElementById(contenedor);
    section.innerHTML = productos.map(p => `
        <label class="caja" for="${p.imagen}">
            <p class="nombreProductos">${p.nombre}</p>
            <div class="imagenPedido ${p.imagen}"></div>
            <button class="btnAgregar" id="${p.imagen}" onclick="agregarEspecial('${p.nombre}')">AGREGAR</button>
        </label>
        `
    ).join('');
}

function mostrarOpciones(opciones, contenedor = "opcionesVentanaEmergente") {
    const ventanaEmergente = document.getElementById("mostrarVentanaEmergente");
    ventanaEmergente.style.display = "block";
    return new Promise(resolve => {
        const section = document.getElementById(contenedor);
        const titulo = opciones[0] || "Opciones";
        const items = opciones.slice(1);
        document.getElementById("tituloVentanaEmergente").innerHTML = `<h3 class="tituloOpciones">${titulo}</h3>`;
        section.innerHTML = items.map(o => `
            <label for="${o}" class="caja">
                <p class="nombreProductos">${o}</p>
                <div class="imagenPedido ${o.split(' ').join('')}"></div>
                <button class="btnAgregar" id="${o}" value="${o}">AGREGAR</button>
            </label>
        `).join('');

        section.querySelectorAll('.btnAgregar').forEach(btn => {
            btn.addEventListener('click', () => {
                const caja = btn.closest('.caja');
                caja.classList.add('agregado');
                setTimeout(() => caja.classList.remove('agregado'), 2000);
                resolve(btn.value);
            }, { once: true });
        });
    });
}

function cerrarVentanaEmergente() {
    const ventanaEmergente = document.getElementById("mostrarVentanaEmergente");
    ventanaEmergente.style.display = "none";
    const opcionesContainer = document.getElementById("opcionesVentanaEmergente");
    opcionesContainer.innerHTML = "";
    restablecerBebidaEnProgreso();
}

function verCarrito() {
    const carritoContainer = document.getElementById("mostrarCarrito");
    carritoContainer.style.display = "block";
    crearTablaCarrito();
}
function cerrarCarrito() {
    const carritoContainer = document.getElementById("mostrarCarrito");
    carritoContainer.style.display = "none";
}

function enviarPedido() {
    const btnConfirmarEnvio = document.getElementById("btnConfirmarEnvio");
    if(btnConfirmarEnvio) {
        if(btnConfirmarEnvio.disabled) return;
        btnConfirmarEnvio.disabled = true;
        btnConfirmarEnvio.innerText = "Enviando...";
    }

    const urlParams = new URLSearchParams(window.location.search);
    const origen = urlParams.get('origen') || ""; // Obtener el origen desde los parámetros de la URL

    const nombreCliente = document.getElementById("nombreCliente").value || "";
    const notaPedido = document.getElementById("notaPedido").value || "";
    const tipoPedidoElement = document.querySelector('input[name="tipoPedido"]:checked');
    const tipoPedido = tipoPedidoElement ? tipoPedidoElement.value : "";

    const notaEspecificaInputs = document.querySelectorAll(".inputEnTabla");
    notaEspecificaInputs.forEach((input, index) => {
        if (carrito[index]) {
            carrito[index].notaEspecifica = input.value || "";
        }
    });

    //Carrito Vacío
    if(carrito.length === 0) {
        alert("Tu carrito está vacío. Agrega algo antes de enviar el pedido.");
            if(btnConfirmarEnvio) {
                btnConfirmarEnvio.disabled = false;
                btnConfirmarEnvio.innerText = "Enviar Pedido";
            }
        return;
    }

    const pedidoRef = ref(database, 'Orotina/' + 'pedidosEnProceso');
    const nuevoPedido = push(pedidoRef);
    const horaCostaRica = new Date().toLocaleString("es-CR", {
        timeZone: "America/Costa_Rica",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    set(nuevoPedido, {
        Origen : origen,
        Cliente : nombreCliente,
        Nota : notaPedido,
        Tipo : tipoPedido,
        Hora: horaCostaRica,
        Items: carrito
    })
    .then(() => {
        historialPedidos.push({ cliente: nombreCliente, nota: notaPedido, items: [...carrito] });
        limpiarCarrito();
        document.getElementById("nombreCliente").value = "";
        document.getElementById("notaPedido").value = "";
        const tipoPedidoChecked = document.querySelector('input[name="tipoPedido"]:checked');
        if (tipoPedidoChecked) {
            tipoPedidoChecked.checked = false;
        }
    })
    .catch(error => {
        console.error("Error al enviar el pedido a Firebase:", error);
    })
    .finally(() => {
        if(btnConfirmarEnvio) {
        btnConfirmarEnvio.disabled = false;
        btnConfirmarEnvio.innerText = "Enviar Pedido";
        }
    });



    cerrarCarrito();
}


function verHistorial() {
        console.log("Historial de Pedidos:", historialPedidos);
        const historialContainer = document.getElementById("mostrarHistorial");
        historialContainer.style.display = "block";
        crearTablaHistorial();
}

function crearTablaHistorial() {
    const tablaHistorialContent = document.getElementById("tablaContentHistorial");
    const ultimosPedidos = historialPedidos.slice(-10);
    tablaHistorialContent.innerHTML = ultimosPedidos.map(pedido => 
        pedido.items.map(item => `
            <tr>
                <td>${item.cantidad || 1}</td>
                <td>${item.bebida}</td>
                <td>${item.leche || " - "}</td>
                <td>${item.saborizante || " - "}</td>
                <td>${pedido.cliente || " - "}</td>
                <td>${item.notaEspecifica || pedido.nota || " - "}</td>
            </tr>
        `).join('')
    ).join('');
}

function cerrarHistorial() {
    const historialContainer = document.getElementById("mostrarHistorial");
    historialContainer.style.display = "none";
}

renderProductos(productos.cafes, "contenedorCafes");
renderBatidos(productos.batidos, "contenedorBatidos");
renderFrio(productos.frios, "contenedorFrios");
renderEspeciales(productos.especiales, "contenedorEspeciales");

// Expose functions to global scope for inline onclick handlers
window.agregarCafe = agregarCafe;
window.agregarBatido = agregarBatido;
window.agregarBatidoRapido = agregarBatidoRapido;
window.agregarFrio = agregarFrio;
window.agregarEspecial = agregarEspecial;
window.verCarrito = verCarrito;
window.cerrarCarrito = cerrarCarrito;
window.cerrarVentanaEmergente = cerrarVentanaEmergente;
window.enviarPedido = enviarPedido;
window.aumentarCantidad = aumentarCantidad;
window.disminuirCantidad = disminuirCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.verHistorial = verHistorial;
window.cerrarHistorial = cerrarHistorial;



// LOGICA DE AGREGAR AL CARRITO

let historialPedidos = [];
let carrito = [];
let bebidaEnProgreso = {
    cantidad: 1,
    bebida: "",
    leche: "",
    saborizante: ""
};
function restablecerBebidaEnProgreso() {
    bebidaEnProgreso = {
        bebida: "",
        leche: "",
        saborizante: ""
    };
}

function limpiarCarrito() {
    carrito = [];
}

function efectoAgregado(nombre) {
    const botonClickeado = document.getElementById(nombre);
    if (botonClickeado) {
        const caja = botonClickeado.closest('.caja');
        caja.classList.add('agregado');
        setTimeout(() => caja.classList.remove('agregado'), 2000);
    }
}


async function agregarCafe(nombre) {
    const producto = buscarProducto(nombre);
    bebidaEnProgreso.bebida = nombre;

    if (producto.llevaTamannos) {
        const tamaño = await mostrarOpciones(opcionesTamannos);
        bebidaEnProgreso.bebida +=  tamaño || "";
    }
    if (producto.llevaLeche) {
        const leche = await mostrarOpciones(opcionesLecheCafes);
        bebidaEnProgreso.leche = leche || "";
    }
    if (producto.llevaSaborizantes) {
        const saborizante = await mostrarOpciones(opcionesSaborizantes);
        bebidaEnProgreso.saborizante = saborizante || "";
    }
    console.log("Cafe agregado al carrito:", bebidaEnProgreso);
    carrito.push(bebidaEnProgreso);

    restablecerBebidaEnProgreso();
    cerrarVentanaEmergente();
    efectoAgregado(producto.imagen);
}

async function agregarBatido() {
    const checkboxes = document.querySelectorAll(".checkbox-batido:checked");
    if (checkboxes.length === 0) {
        alert("Por favor, selecciona al menos un ingrediente para su batido.");
        return;
    }
    bebidaEnProgreso.bebida = "Batido: " + Array.from(checkboxes).map(cb => cb.value).join(", ");

    const leche = await mostrarOpciones(opcionesLecheBatidos);
    bebidaEnProgreso.leche = "Leche " + leche;
    if(bebidaEnProgreso.leche.includes("Agua")) {
        bebidaEnProgreso.leche = "En Agua";
    }
    checkboxes.forEach(cb => cb.checked = false);
    carrito.push(bebidaEnProgreso);
    restablecerBebidaEnProgreso();
    cerrarVentanaEmergente();
}

async function agregarBatidoRapido(nombre) {
    bebidaEnProgreso.bebida = nombre;
    if(nombre.includes("Agua")) {
        const numero = await mostrarOpciones(BatidoRapidoAgua);
        bebidaEnProgreso.bebida += numero;
    }
    else if(nombre.includes("Leche")) {
        const numero = await mostrarOpciones(BatidoRapidoLeche);
        bebidaEnProgreso.bebida += numero;
    }
    carrito.push(bebidaEnProgreso);
    restablecerBebidaEnProgreso();
    cerrarVentanaEmergente();
    nombre = nombre.split(' ').join('');
    efectoAgregado(nombre);
}

async function agregarFrio(nombre) {
    const producto = buscarProducto(nombre);
    bebidaEnProgreso.bebida = nombre;

    if (producto.opcionesMatcha) {
        const matcha = await mostrarOpciones(opcionesMatcha);
        bebidaEnProgreso.bebida = matcha;
    }
    if (producto.llevaLeche) {
        const leche = await mostrarOpciones(opcionesLecheBatidos);
        bebidaEnProgreso.leche = "Leche " + (leche || "");
    }
    if (producto.llevaSaborizantes) {
        const saborizante = await mostrarOpciones(opcionesSaborizantes);
        bebidaEnProgreso.saborizante = saborizante || "";
    }
    if (producto.llevaTamannos) {
        const tamaño = await mostrarOpciones(opcionesTamannos);
        bebidaEnProgreso.bebida +=  " " + (tamaño || "");
    }
    if (producto.llevaHelado) {
        const helado = await mostrarOpciones(opcionesHelados);
        bebidaEnProgreso.leche = (helado || "");
    }
    if (producto.opcionesJugoVerde) {
        const jugoVerde = await mostrarOpciones(opcionesJugoVerde);
        bebidaEnProgreso.bebida += ": " + (jugoVerde || "");
    }
    if (producto.llevaSaborizantesNaturales) {
        const saborizanteNatural = await mostrarOpciones(opcionesSaborizantesNaturales);
        bebidaEnProgreso.saborizante = (saborizanteNatural || "");
    }
    if (producto.opcionesRefresher) {
        const refresher = await mostrarOpciones(opcionesRefresher);
        bebidaEnProgreso.bebida += " " + (refresher || "");
    }
    if (producto.llevatoppingsRefresher) {
        const toppingRefresher = await mostrarOpciones(opcionestoppingsRefresher);
        bebidaEnProgreso.saborizante  = (toppingRefresher || "");
    }
    if (producto.opcionesLimonada) {
        const limonada = await mostrarOpciones(opcionesLimonada);
        bebidaEnProgreso.bebida = limonada;
    }
    if (producto.llevaToppingTaro) {
        const toppingTaro = await mostrarOpciones(opcionesToppingTaro);
        bebidaEnProgreso.saborizante = (toppingTaro || "");
    }
    carrito.push(bebidaEnProgreso);
    restablecerBebidaEnProgreso();
    cerrarVentanaEmergente();
    efectoAgregado(producto.imagen);
}

async function agregarEspecial(nombre) {
    bebidaEnProgreso.bebida = nombre;
    const producto = buscarProducto(nombre);
    efectoAgregado(producto.imagen);

    if (producto.opcionesCrepa) {
        const crepa = await mostrarOpciones(opcionesCrepa);
        bebidaEnProgreso.bebida += " " + (crepa || "");
    }
    if (producto.llevaHelado) {
        const helado = await mostrarOpciones(opcionesHelados);
        bebidaEnProgreso.leche = helado || "";
    }
    if (producto.llevaSirope) {
        const sirope = await mostrarOpciones(opcionesSiropes);
        bebidaEnProgreso.saborizante = (sirope || "");
    }
    carrito.push(bebidaEnProgreso);
    restablecerBebidaEnProgreso();
    cerrarVentanaEmergente();
    efectoAgregado(producto.imagen);
}

function crearTablaCarrito() {
    const tablaContent = document.getElementById("tablaContent");
    tablaContent.innerHTML = carrito.map((item, index) => `
        <tr>
            <td><button class="btnCantidad" id="btnAumentar" onclick="aumentarCantidad(${index})">+</button></td>
            <td><button class="btnCantidad" id="btnDisminuir" onclick="disminuirCantidad(${index})">-</button></td>
            <td>${item.cantidad || 1}</td>
            <td>${item.bebida}</td>
            <td>${item.leche || " - "}</td>
            <td>${item.saborizante || " - "}</td>
            <td><input type="text" class="inputEnTabla" id="notaEspecifica${index}" placeholder="Nota de bebida"></td>
            <td><button class="btnEliminarLinea" onclick="eliminarDelCarrito(${index})">Eliminar</button></td>
        </tr>
    `).join('');
}

function aumentarCantidad(index) {
    carrito[index].cantidad = (carrito[index].cantidad || 1) + 1;
    crearTablaCarrito();
}

function disminuirCantidad(index) {
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad -= 1;
    }
    crearTablaCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    crearTablaCarrito();
}
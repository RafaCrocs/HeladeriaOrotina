import { database, ref, set, push } from './firebase.js';
import { get, runTransaction } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

function obtenerClaveDiaLocal() {
	const fecha = new Date();
	const opciones = { timeZone: 'America/Costa_Rica', year: 'numeric', month: '2-digit', day: '2-digit' };
	const partesFecha = fecha.toLocaleDateString('es-CR', opciones).split('/');
	return `${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`;
}

function renderProductos(productos, contenedor) {
	const section = document.getElementById(contenedor);
	section.innerHTML = productos.map((producto) => `
		<label class="caja" for="${producto.imagen}">
			<p class="nombreProductos">${producto.nombre}</p>
			<div class="imagenPedido ${producto.imagen}"></div>
			<button class="btnAgregar" id="${producto.imagen}" onclick="agregarProducto('${producto.nombre}')">AGREGAR</button>
		</label>
	`).join('');
}

function renderOrdenesCocina(ordenes, contenedor) {
	const section = document.getElementById(contenedor);
	section.innerHTML = ordenes.map((producto) => `
		<label class="caja" for="${producto.imagen}">
			<p class="nombreProductos">${producto.nombre}</p>
			<div class="imagenPedido ${producto.imagen}"></div>
			<button class="btnAgregar" id="${producto.imagen}" onclick="agregarProducto('${producto.nombre}')">AGREGAR</button>
		</label>
	`).join('');
}

const estadoSeleccionCocina = {
	opcionHuevo: null,
	opcionEmpanada: null,
};

let numeroPedidoActual = '...';
const ordenCocina = [];

async function cargarNumeroPedido() {
	const diaClave = obtenerClaveDiaLocal();
	const contadorRef = ref(database, `Orotina/Cocina/contador/${diaClave}`);
	const snapshot = await get(contadorRef);
	numeroPedidoActual = (snapshot.val() || 0) + 1;
	renderCarritoCocina();
}

window.estadoSeleccionCocina = estadoSeleccionCocina;
window.ordenCocina = ordenCocina;

function abrirVentanaEmergente(titulo) {
	const ventanaEmergente = document.getElementById('mostrarVentanaEmergente');
	const tituloVentanaEmergente = document.getElementById('tituloVentanaEmergente');
	const opcionesVentanaEmergente = document.getElementById('opcionesVentanaEmergente');

	ventanaEmergente.style.display = 'block';
	tituloVentanaEmergente.textContent = titulo;
	opcionesVentanaEmergente.innerHTML = '';

	return opcionesVentanaEmergente;
}

function mostrarOpciones(opciones, titulo) {
	const opcionesVentanaEmergente = abrirVentanaEmergente(titulo);

	opcionesVentanaEmergente.innerHTML = opciones.map((opcion) => `
		<label for="${opcion.nombre}" class="caja">
			<p class="nombreProductos">${opcion.nombre}</p>
			<div class="imagenPedido ${opcion.imagen}"></div>
			<button class="btnAgregar" id="${opcion.nombre}" value="${opcion.nombre}">AGREGAR</button>
		</label>
	`).join('');

	return new Promise((resolve) => {
		const botones = opcionesVentanaEmergente.querySelectorAll('.btnAgregar');

		botones.forEach((boton) => {
			boton.addEventListener('click', () => {
				const opcionSeleccionada = opciones.find((opcion) => opcion.nombre === boton.value);
				cerrarVentanaEmergente();
				resolve(opcionSeleccionada);
			}, { once: true });
		});
	});
}

function mostrarExtras(extras, titulo) {
	const opcionesVentanaEmergente = abrirVentanaEmergente(titulo);

	opcionesVentanaEmergente.innerHTML = `
		<div class="extrasContainer" id="extrasHuevoContainer">
			${extras.map((extra) => `
				<button class="btnExtra" data-extra="${extra}">${extra}</button>
			`).join('')}
		</div>
	`;

	const accionesVentanaEmergente = document.getElementById('accionesVentanaEmergente');
	accionesVentanaEmergente.innerHTML = `
		<button class="btnTerminarExtras" id="btnTerminarExtras">CONFIRMAR</button>
	`;

	return new Promise((resolve) => {
		const extrasHuevoContainer = document.getElementById('extrasHuevoContainer');
		const botonTerminar = document.getElementById('btnTerminarExtras');

		extrasHuevoContainer.querySelectorAll('.btnExtra').forEach((boton) => {
			boton.addEventListener('click', () => {
				boton.classList.toggle('btnExtraActivo');
			});
		});

		botonTerminar.addEventListener('click', () => {
			const extrasSeleccionados = Array.from(extrasHuevoContainer.querySelectorAll('.btnExtraActivo'))
				.map((b) => b.dataset.extra);
			cerrarVentanaEmergente();
			resolve(extrasSeleccionados);
		}, { once: true });
	});
}

function crearItemOrden(producto, opcionSeleccionada = null, extrasSeleccionados = []) {
	return {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		producto: producto.nombre,
		opcion: opcionSeleccionada ? opcionSeleccionada.nombre : producto.nombre,
		imagen: opcionSeleccionada ? opcionSeleccionada.imagen : producto.imagen,
		extras: [...extrasSeleccionados],
		cantidad: 1,
	};
}

function agregarItemALaOrden(itemOrden) {
	ordenCocina.push(itemOrden);
	renderCarritoCocina();
}

function renderCarritoCocina() {
	const carritoCards = document.getElementById('carritoCards');
	const carritoVacio = document.getElementById('carritoVacio');
	const displayNumero = document.getElementById('displayNumeroPedido');

	if (!carritoCards || !carritoVacio) {
		return;
	}

	if (displayNumero) {
		displayNumero.textContent = `Pedido #${numeroPedidoActual}`;
	}

	carritoVacio.style.display = ordenCocina.length === 0 ? 'block' : 'none';
	carritoCards.innerHTML = ordenCocina.map((item) => `
		<article class="caja cajaCarrito">
			<p class="nombreProductos">${item.opcion}</p>
			<div class="imagenPedido ${item.imagen}"></div>
			<div class="detalleCarrito">
				<p class="textoSecundario">Extras: ${item.extras.length ? item.extras.join(', ') : 'Sin extras'}</p>
			</div>
			<div class="cantidadCarrito">
				<button class="btnCantidadCocina btnMenos" onclick="cambiarCantidadCocina('${item.id}', -1)">−</button>
				<span class="cantidadNumero">${item.cantidad}</span>
				<button class="btnCantidadCocina btnMas" onclick="cambiarCantidadCocina('${item.id}', 1)">+</button>
			</div>
		</article>
	`).join('');
}

function cambiarCantidadCocina(idItem, delta) {
	const indice = ordenCocina.findIndex((item) => item.id === idItem);
	if (indice === -1) return;

	ordenCocina[indice].cantidad += delta;
	if (ordenCocina[indice].cantidad <= 0) {
		ordenCocina.splice(indice, 1);
	}
	renderCarritoCocina();
}

function limpiarPedidoCocina() {
	ordenCocina.length = 0;
	estadoSeleccionCocina.opcionHuevo = null;
	estadoSeleccionCocina.opcionEmpanada = null;

	const notaPedido = document.getElementById('notaPedido');
	if (notaPedido) notaPedido.value = '';

	renderCarritoCocina();
}

function cerrarVentanaEmergente() {
	const ventanaEmergente = document.getElementById('mostrarVentanaEmergente');
	const tituloVentanaEmergente = document.getElementById('tituloVentanaEmergente');
	const opcionesVentanaEmergente = document.getElementById('opcionesVentanaEmergente');
	const accionesVentanaEmergente = document.getElementById('accionesVentanaEmergente');

	ventanaEmergente.style.display = 'none';
	tituloVentanaEmergente.textContent = '';
	opcionesVentanaEmergente.innerHTML = '';
	accionesVentanaEmergente.innerHTML = '';
}

function verCarrito() {
	const ventanaCarrito = document.getElementById('mostrarCarrito');
	renderCarritoCocina();
	ventanaCarrito.style.display = 'block';
}

function cerrarCarrito() {
	const ventanaCarrito = document.getElementById('mostrarCarrito');
	ventanaCarrito.style.display = 'none';
}

async function enviarPedido() {
	const btnConfirmarEnvio = document.getElementById('btnConfirmarEnvio');
	if (btnConfirmarEnvio) {
		if (btnConfirmarEnvio.disabled) return;
		btnConfirmarEnvio.disabled = true;
		btnConfirmarEnvio.innerText = 'Enviando...';
	}

	if (ordenCocina.length === 0) {
		alert('Agrega productos antes de enviar el pedido.');
		if (btnConfirmarEnvio) {
			btnConfirmarEnvio.disabled = false;
			btnConfirmarEnvio.innerText = 'Enviar Pedido';
		}
		return;
	}

	const diaClave = obtenerClaveDiaLocal();
	const contadorRef = ref(database, `Orotina/Cocina/contador/${diaClave}`);
	let numeroUsado = numeroPedidoActual;

	await runTransaction(contadorRef, () => numeroUsado);

	const horaCostaRica = new Date().toLocaleString('es-CR', {
		timeZone: 'America/Costa_Rica',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	});

	const pedidos = ordenCocina.map((item) => ({
		PedidoPrincipal: item.opcion,
		Extra: [...item.extras],
		Cantidad: item.cantidad,
	}));

	const pedido = {
		Numero: numeroUsado,
		Hora: horaCostaRica,
		Nota: document.getElementById('notaPedido')?.value.trim() || '',
		Pedidos: pedidos,
	};

	const pedidoRef = ref(database, 'Orotina/Cocina');
	const nuevoPedido = push(pedidoRef);

	set(nuevoPedido, pedido)
		.then(async () => {
			limpiarPedidoCocina();
			cerrarCarrito();
			await cargarNumeroPedido();
		})
		.catch((error) => {
			console.error('Error al enviar pedido de cocina a Firebase:', error);
			alert('No se pudo enviar el pedido. Intenta de nuevo.');
		})
		.catch((error) => {
			console.error('Error al enviar pedido de cocina a Firebase:', error);
			alert('No se pudo enviar el pedido. Intenta de nuevo.');
		})
		.finally(() => {
			if (btnConfirmarEnvio) {
				btnConfirmarEnvio.disabled = false;
				btnConfirmarEnvio.innerText = 'Enviar Pedido';
			}
		});
}

async function agregarProducto(nombre) {
	const producto = window.BuscarProductosCocina(nombre);
	if (producto.opcionesHuevo) {
		const opcionHuevo = await mostrarOpciones(window.opcionesHuevo, `Opciones para ${nombre}`);
		const extrasSeleccionados = await mostrarExtras(window.extrasHuevo, `Extras para ${opcionHuevo.nombre}`);
		estadoSeleccionCocina.opcionHuevo = opcionHuevo;

		const itemOrden = crearItemOrden(producto, opcionHuevo, extrasSeleccionados);
		agregarItemALaOrden(itemOrden);
		return itemOrden;
	}

	if (producto.opcionesEmpanada) {
		const opcionEmpanada = await mostrarOpciones(window.opcionesEmpanada, `Opciones para ${nombre}`);
		estadoSeleccionCocina.opcionEmpanada = opcionEmpanada;

		const itemOrden = crearItemOrden(producto, opcionEmpanada);
		agregarItemALaOrden(itemOrden);
		return itemOrden;
	}
	if (producto.opcionesEmpanadaArreglada) {
		const opcionEmpanadaArreglada = await mostrarOpciones(window.opcionesEmpanadaArreglada, `Opciones para ${nombre}`);
		estadoSeleccionCocina.opcionEmpanadaArreglada = opcionEmpanadaArreglada;

		const itemOrden = crearItemOrden(producto, opcionEmpanadaArreglada);
		agregarItemALaOrden(itemOrden);
		return itemOrden;
	}
	if (producto.opcionesSandwich) {
		const opcionSandwich = await mostrarOpciones(window.opcionesSandwich, `Opciones para ${nombre}`);
		estadoSeleccionCocina.opcionSandwich = opcionSandwich;

		const itemOrden = crearItemOrden(producto, opcionSandwich);
		agregarItemALaOrden(itemOrden);
		return itemOrden;
	}

	if (producto.opcionesHamburguesa) {
		const opcionHamburguesa = await mostrarOpciones(window.opcionesHamburguesa, `Opciones para ${nombre}`);
		estadoSeleccionCocina.opcionHamburguesa = opcionHamburguesa;

		const itemOrden = crearItemOrden(producto, opcionHamburguesa);
		agregarItemALaOrden(itemOrden);
		return itemOrden;
	}
	if(producto.tamannosPapasFritas) {
		const opcionTamannoPapasFritas = await mostrarOpciones(window.tamannosPapasFritas, `Opciones para ${nombre}`);
		estadoSeleccionCocina.opcionTamannoPapasFritas = opcionTamannoPapasFritas;
		
		const itemOrden = crearItemOrden(producto, opcionTamannoPapasFritas);
		agregarItemALaOrden(itemOrden);
		return itemOrden;
	}

	const itemOrden = crearItemOrden(producto);
	agregarItemALaOrden(itemOrden);
	return itemOrden;
}
window.agregarProducto = agregarProducto;
window.cerrarVentanaEmergente = cerrarVentanaEmergente;
window.verCarrito = verCarrito;
window.cerrarCarrito = cerrarCarrito;
window.enviarPedido = enviarPedido;
window.cambiarCantidadCocina = cambiarCantidadCocina;

window.cerrarHistorial = function() {
	document.getElementById('mostrarHistorial').style.display = 'none';
};

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
					return `<tr><td>${item.Cantidad || 1}</td><td>${item.PedidoPrincipal || '-'}</td><td>${extras}</td></tr>`;
				}).join('')
				: '';

			return `
				<div style="margin-bottom:16px; border:1px solid #ccc; padding:8px;">
					<p><strong>Numero: ${pedido.Numero || '-'}</strong> &nbsp; Hora: ${pedido.Hora || '-'}</p>
					<table class="tablaPedido" border="1">
						<thead class="tablaEncabezado" style="background-color:#ddd;">
							<tr><th>Cant</th><th>Producto</th><th>Extras</th></tr>
						</thead>
						<tbody>${filas}</tbody>
					</table>
				</div>
			`;
		}).join('');
	}

	document.getElementById('mostrarHistorial').style.display = 'flex';
};

renderProductos(window.productosCocina, 'contenedorCocina');
renderOrdenesCocina(window.ordenesCocina, 'contenedorOrdenes');
renderCarritoCocina();
cargarNumeroPedido();
    
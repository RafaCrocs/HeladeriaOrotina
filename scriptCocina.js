import { database, ref, set, push } from './firebase.js';

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

const estadoSeleccionCocina = {
	opcionHuevo: null,
	opcionEmpanada: null,
	colorBanderin: '',
};

const ordenCocina = [];

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
		<div class="opcionesVentanaEmergente" id="extrasHuevoContainer"></div>
		<div class="accionesEmergente">
			<button class="btnAgregar" id="btnTerminarExtras">TERMINAR</button>
		</div>
	`;

	const extrasHuevoContainer = document.getElementById('extrasHuevoContainer');
	extrasHuevoContainer.innerHTML = extras.map((extra) => `
		<label for="${extra}" class="caja cajaExtraOpcion" data-extra="${extra}">
			<p class="nombreProductos">${extra}</p>
			<button class="btnAgregar btnExtraSeleccion" id="${extra}" value="${extra}">${extra}</button>
		</label>
	`).join('');

	return new Promise((resolve) => {
		const botonesExtras = extrasHuevoContainer.querySelectorAll('.btnExtraSeleccion');
		const botonTerminar = document.getElementById('btnTerminarExtras');

		botonesExtras.forEach((boton) => {
			boton.addEventListener('click', () => {
				const caja = boton.closest('.caja');
				caja.classList.toggle('agregado');
			});
		});

		botonTerminar.addEventListener('click', () => {
			const extrasSeleccionados = Array.from(extrasHuevoContainer.querySelectorAll('.caja.agregado'))
				.map((caja) => caja.dataset.extra);

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
	};
}

function agregarItemALaOrden(itemOrden) {
	ordenCocina.push(itemOrden);
	renderCarritoCocina();
}

function renderCarritoCocina() {
	const carritoCards = document.getElementById('carritoCards');
	const carritoVacio = document.getElementById('carritoVacio');

	if (!carritoCards || !carritoVacio) {
		return;
	}

	carritoVacio.style.display = ordenCocina.length === 0 ? 'block' : 'none';
	carritoCards.innerHTML = ordenCocina.map((item) => `
		<article class="caja cajaCarrito">
			<p class="nombreProductos">${item.opcion}</p>
			<div class="imagenPedido ${item.imagen}"></div>
			<div class="detalleCarrito">
				<p class="textoSecundario">Extras: ${item.extras.length ? item.extras.join(', ') : 'Sin extras'}</p>
			</div>
			<button class="btnCerrar btnEliminarItemCocina" onclick="eliminarItemCocina('${item.id}')">Eliminar</button>
		</article>
	`).join('');
}

function eliminarItemCocina(idItem) {
	const indice = ordenCocina.findIndex((item) => item.id === idItem);

	if (indice === -1) {
		return;
	}

	ordenCocina.splice(indice, 1);
	renderCarritoCocina();
}

function seleccionarColorBanderin(colorOElemento) {
	const colorSeleccionado = typeof colorOElemento === 'string'
		? colorOElemento
		: colorOElemento?.dataset?.color || colorOElemento?.textContent?.trim() || '';

	if (!colorSeleccionado) {
		return;
	}

	estadoSeleccionCocina.colorBanderin = colorSeleccionado;

	document.querySelectorAll('.btnColorBanderin').forEach((boton) => {
		const colorBoton = boton.dataset.color || boton.textContent.trim();
		boton.classList.toggle('activo', colorBoton === colorSeleccionado);
	});

	const estadoBanderin = document.getElementById('estadoBanderin');
	if (estadoBanderin) {
		estadoBanderin.textContent = `Banderin seleccionado: ${colorSeleccionado}`;
	}
}

function limpiarPedidoCocina() {
	ordenCocina.length = 0;
	estadoSeleccionCocina.opcionHuevo = null;
	estadoSeleccionCocina.opcionEmpanada = null;
	estadoSeleccionCocina.colorBanderin = '';

	const notaPedido = document.getElementById('notaPedido');
	const paraLlevar = document.getElementById('paraLlevar');
	const estadoBanderin = document.getElementById('estadoBanderin');

	if (notaPedido) {
		notaPedido.value = '';
	}
	if (estadoBanderin) {
		estadoBanderin.textContent = 'Sin color seleccionado';
	}

	document.querySelectorAll('.btnColorBanderin').forEach((boton) => {
		boton.classList.remove('activo');
	});

	renderCarritoCocina();
}

function cerrarVentanaEmergente() {
	const ventanaEmergente = document.getElementById('mostrarVentanaEmergente');
	const tituloVentanaEmergente = document.getElementById('tituloVentanaEmergente');
	const opcionesVentanaEmergente = document.getElementById('opcionesVentanaEmergente');

	ventanaEmergente.style.display = 'none';
	tituloVentanaEmergente.textContent = '';
	opcionesVentanaEmergente.innerHTML = '';
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

function enviarPedido() {
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

	if (!estadoSeleccionCocina.colorBanderin) {
		alert('Selecciona el color del banderin antes de enviar el pedido.');
		if (btnConfirmarEnvio) {
			btnConfirmarEnvio.disabled = false;
			btnConfirmarEnvio.innerText = 'Enviar Pedido';
		}
		return;
	}

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
	}));

	const pedido = {
		Banderin: estadoSeleccionCocina.colorBanderin,
		Hora: horaCostaRica,
		Pedidos: pedidos,
	};

	const pedidoRef = ref(database, 'Orotina/Cocina');
	const nuevoPedido = push(pedidoRef);

	set(nuevoPedido, pedido)
		.then(() => {
			console.log('Pedido cocina enviado:', pedido);
			limpiarPedidoCocina();
			cerrarCarrito();
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

function verHistorial() {
	alert('El historial de cocina todavia no esta disponible.');
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

	const itemOrden = crearItemOrden(producto);
	agregarItemALaOrden(itemOrden);
	return itemOrden;
}

window.agregarProducto = agregarProducto;
window.cerrarVentanaEmergente = cerrarVentanaEmergente;
window.verCarrito = verCarrito;
window.cerrarCarrito = cerrarCarrito;
window.enviarPedido = enviarPedido;
window.verHistorial = verHistorial;
window.seleccionarColorBanderin = seleccionarColorBanderin;
window.eliminarItemCocina = eliminarItemCocina;

renderProductos(window.productosCocina, 'contenedorCocina');
renderCarritoCocina();
    
productosCocina = [
    { nombre: "Huevo", imagen:"Huevo", opcionesHuevo: true },
    { nombre: "Empanada", imagen:"Empanada", opcionesEmpanada: true },
    { nombre: "Empanada Arreglada", imagen:"EmpanadaArreglada", opcionesEmpanadaArreglada: true },
    { nombre: "Sandwich", imagen:"Sandwich", opcionesSandwich: true },
    { nombre: "Hamburguesa", imagen:"Hamburguesa", opcionesHamburguesa: true },
    { nombre: "Prensadas de Queso", imagen:"PrensadasQueso" }
]

ordenesCocina = [
    { nombre: "Orden Tostadas", imagen:"OrdenTostadas" },
    { nombre: "Orden Tortillas Blancas", imagen:"TortillasBlancas" },
    { nombre: "Tortilla Aliñada", imagen:"TortillaAliñada" },
    { nombre: "Orden Pinto SIN Olores", imagen:"PintoSinOlores" },
    { nombre: "Orden Arroz Blanco", imagen:"ArrozBlanco" },
    { nombre: "Orden de Papas Fritas", imagen:"PapasFritas", tamannosPapasFritas: true },
    { nombre: "Orden de Tocineta", imagen:"OrdenTocineta" },
    { nombre: "Orden de Tomate", imagen:"OrdenTomate" },
    { nombre: "Orden de Pepino", imagen:"OrdenPepino" },
]

opcionesHuevo = [
    { nombre: "Huevo Picado", imagen:"HuevoPicado" },
    { nombre: "Huevo Frito", imagen:"HuevoFrito", opcionesHuevoFrito: true },
    { nombre: "Torta de Huevo", imagen:"TortaHuevo" },
    { nombre: "Omelet", imagen:"Omelet" },
    { nombre: "Huevo Duro", imagen:"HuevoDuro" },
]

opcionesHuevoFrito = [
    { nombre: "Tierno", imagen:"HuevoFritoTierno" },
    { nombre: "Termino Medio", imagen:"HuevoFritoTerminoMedio" },
]


opcionesEmpanada = [
    { nombre: "Empanada de Carne", imagen:"EmpanadaCarne" },
    { nombre: "Empanada de Pollo", imagen:"EmpanadaPollo" },
    { nombre: "Empanada de Queso", imagen:"EmpanadaQueso" },
]

opcionesEmpanadaArreglada = [
    { nombre: "Empanada Arreglada de Carne", imagen:"EmpanadaArregladaCarne" },
    { nombre: "Empanada Arreglada de Pollo", imagen:"EmpanadaArregladaPollo" }
]

opcionesSandwich = [
    { nombre: "Sandwich de Carne", imagen:"SandwichCarne" },
    { nombre: "Sandwich de Pollo", imagen:"SandwichPollo" },
    { nombre: "Sandwich de Jamon y Queso", imagen:"SandwichJamonQueso" },
]

opcionesHamburguesa = [
    { nombre: "Hamburguesa CON Papas", imagen:"HamburguesaPapas" },
    { nombre: "Hamburguesa SIN Papas", imagen:"HamburguesaSinPapas" },
]

tamannosPapasFritas = [
    { nombre: "Papas Fritas Pequeñas", imagen:"PapasFritasPequenas" },
    { nombre: "Papas Fritas Grandes", imagen:"PapasFritasGrandes" }
]


extrasHuevo = ["Con Olores", "Cebolla", "Tomate", "Jamon", "Tomate", "Queso"]


function BuscarProductosCocina(nombre) {
    return productosCocina.find(producto => producto.nombre === nombre)
        || ordenesCocina.find(producto => producto.nombre === nombre);
}
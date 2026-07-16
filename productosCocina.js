productosCocina = [
    { nombre: "Huevo", imagen:"Huevo", opcionesHuevo: true },
    { nombre: "Tortilla", imagen:"Tortilla" },
    { nombre: "Empanada", imagen:"Empanada", opcionesEmpanada: true },
    { nombre: "Sandwich", imagen:"Sandwich" },
]

opcionesHuevo = [
    { nombre: "Huevo Frito", imagen:"HuevoFrito" },
    { nombre: "Huevo Picado", imagen:"HuevoPicado" }
]


opcionesEmpanada = [
    { nombre: "Empanada de Pollo", imagen:"EmpanadaPollo" },
    { nombre: "Empanada de Carne", imagen:"EmpanadaCarne" },
    { nombre: "Empanada de Queso", imagen:"EmpanadaQueso" },
]


extrasHuevo = ["Cebolla", "Tomate", "Jamon"]


function BuscarProductosCocina(nombre) {
    return productosCocina.find(producto => producto.nombre === nombre);
}
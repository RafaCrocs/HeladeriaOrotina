productosCocina = [
    { nombre: "Huevo ", imagen:"Huevo" },
    { nombre: "Tortilla ", imagen:"Tortilla" },
    { nombre: "Empanada ", imagen:"Empanada" },
    { nombre: "Sandwich ", imagen:"Sandwich" },
]

opcionesHuevo = [
    { nombre: "Huevo Frito", imagen:"HuevoFrito" },
    { nombre: "Huevo Picado", imagen:"HuevoPicado" },
    { nombre: "Huevo Duro", imagen:"HuevoDuro" },
]

opcionesEmpanada = [
    { nombre: "Empanada de Pollo", imagen:"EmpanadaPollo" },
    { nombre: "Empanada de Carne", imagen:"EmpanadaCarne" },
    { nombre: "Empanada de Queso", imagen:"EmpanadaQueso" },
]

function getProductosCocina(nombre) {
    return productosCocina.find(producto => producto.nombre === nombre);
}
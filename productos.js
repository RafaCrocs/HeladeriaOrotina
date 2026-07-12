



const productos = {
    cafes:[
        { nombre: "Americano ", imagen:"Americano", llevaTamannos: true },
        { nombre: "Capuchino ", imagen:"Capuchino", llevaLeche: true, llevaSaborizantes: true, llevaTamannos: true },
        { nombre: "Mokaccino ", imagen:"Mokaccino", llevaLeche: true, llevaTamannos: true },
        { nombre: "Latte ", imagen:"Latte", llevaLeche: true, llevaSaborizantes: true },
        { nombre: "Chocolate Caliente ", imagen:"ChocolateCaliente", llevaLeche: true, llevaTamannos: true},
        { nombre: "Espresso ", imagen:"Espresso" },
        { nombre: "Espresso Doble ", imagen:"EspressoDoble" },
        { nombre: "Macchiato ", imagen:"Macchiato", llevaLeche: true },
        { nombre: "Cortado ", imagen:"Cortado", llevaLeche: true },
        { nombre: "Flat White ", imagen:"FlatWhite", llevaLeche: true },
        { nombre: "Matcha Caliente ", imagen:"MatchaCaliente" }
    ],
    batidos:[
        { nombre: "Piña"},
        { nombre: "Banano"},
        { nombre: "Mango"},
        { nombre: "Naranja"},
        { nombre: "Papaya"},
        { nombre: "Kiwi"},
        { nombre: "Sandia"},
        { nombre: "Fresa"},
        { nombre: "Mora"},
        { nombre: "Maracuya"},
        { nombre: "Guanabana"},
        { nombre: "Melocoton"},
        { nombre: "Arandano"},
        { nombre: "Coco"},
    ],
    frios:[
            { nombre: "Iced Latte", imagen:"IcedLatte", llevaLeche: true, llevaSaborizantes: true },
            { nombre: "Cold Brew", imagen:"ColdBrew"},
            { nombre: "Cold Brew Latte", imagen:"ColdBrewLatte", llevaLeche: true, llevaSaborizantes: true },
            { nombre: "Iced Americano", imagen:"IcedAmericano", llevaTamannos: true },
            { nombre: "Affogato El Jardin", imagen:"AffogatoElJardin"},
            { nombre: "Affogato", imagen:"Affogato"},
            { nombre: "Shake Coffe House", imagen:"ShakeCoffeeHouse", llevaLeche: true, llevaSaborizantes: true },
            { nombre: "Frappuccino", imagen:"Frappuccino", llevaLeche: true, llevaSaborizantes: true },
            { nombre: "Iced Chocolate", imagen:"IcedChocolate", llevaLeche: true, llevaHelado: true },
            { nombre: "MilkShake", imagen:"MilkShake", llevaHelado: true },
            { nombre: "Matcha", imagen:"Matcha", llevaLeche: true, opcionesMatcha: true, llevaEspuma: true },
            { nombre: "Jugo Verde", imagen:"JugoVerde", opcionesJugoVerde: true, llevaSaborizantesNaturales: true },
            { nombre: "Granizado", imagen:"Granizado", llevaHelado: true },
            { nombre: "Refresher", imagen:"Refresher", opcionesRefresher: true, llevatoppingsRefresher: true },
            { nombre: "Taro", imagen:"Taro", llevaToppingTaro: true },
            { nombre: "Limonada", imagen:"Limonada", opcionesLimonada: true },
            { nombre: "Piña Colada", imagen:"PiñaColada", llevaLeche: true },
            {nombre: "Dirty Chai", imagen:"DirtyChai", llevaLeche: true},
            {nombre: "Taro Espumoso", imagen:"TaroEspumoso", llevaLeche: true, llevaToppingTaro: true, llevaEspuma: true},
            {nombre: "Frappe Oreo", imagen:"FrappeOreo", llevaLeche: true, llevaSaborizantes: true },
            {nombre: "Dragon Fresh", imagen:"DragonFresh"},
            {nombre: "Esmeralda Fresh", imagen:"EsmeraldaFresh"},
            {nombre: "Tropical Sunnet", imagen:"TropicalSunnet"},
    ],
    especiales:[
        { nombre: "Ensalada de Frutas", imagen:"EnsaladaFrutas", llevaHelado: true },
        { nombre: "Banana Split", imagen:"BananaSplit", llevaHelado: true },
        { nombre: "Crepa", imagen:"Crepa", opcionesCrepa: true, llevaHelado: true },
        { nombre: "Sundae", imagen:"Sundae", llevaHelado: true, llevaSirope: true },
        { nombre: "Crema con Fresas", imagen:"CremaConFresas", llevaSirope: true },
    ]
}

const opcionesTamannos = ["Tamaño", "Pequeño", "Grande"];
const opcionesLecheCafes = ["Tipo de Leche", "Regular", "Delactomy", "Semi Descremada", "Almendra", "Avena"];
const opcionesLecheBatidos = ["Tipo de Leche", "Agua/Sin Leche", "Regular", "Delactomy", "Semi Descremada", "Almendra", "Avena"];
const opcionesSaborizantes = ["Saborizante", "Sin Saborizante", "Vainilla", "Caramelo", "Crema Avellanas", "Crema Irlandesa", "Chocolate Oscuro", "Nuez", "Menta", "Amaretto"];
const opcionesHelados = ["Helado", "Sin Helado", "Helado Vainilla", "Helado Chocolate", "Helado Fresa", "Helado Chocochips", "Helado Galleta", "Helado Ron Con Frutas", "Helado Caramelo Vainilla", "Helado Ron Con Pasas", "Helado Napolitano", "Helado Coco", "Helado FresaNieve", "Helado Naranja Piña", "Helado Combinado", "Helado Chicle"];
const opcionesMatcha = ["Matcha...", "Matcha Regular", "Matcha Mango", "Matcha Fresa"];
const opcionesJugoVerde = ["Jugo Verde...", "En Agua", "En Limonada", "En jugo Naranja"];
const opcionesSaborizantesNaturales = ["Saborizante Natural", "Sin Saborizante", "Piña", "Manzana Verde"];
const opcionesRefresher = ["Refresher de...", "Fresa", "Mango", "Maracuya", "Arandano", "Sandia", "Pitahaya"];
const opcionestoppingsRefresher = ["Topping", "Sin topping", "Bubble Fresa", "Bubble Mango", "Bubble Maracuya", "Bubble Arandano", "Bubble Sandia", "Bubble Melocoton", "Bubble Pitahaya"];
const opcionesToppingTaro = ["Topping", "Sin Topping", "Con Tapioca"];
const opcionesLimonada = ["Limonada...", "Limonada Regular", "Limonada de Fresa"];
const BatidoRapidoAgua = ["Numero de Batido...", "1", "2", "3", "4", "5", "6"];
const BatidoRapidoLeche = ["Numero de Batido...", "1", "2", "3", "4", "5"];
const opcionesCrepa = ["Numero de Crepa...", "1", "2", "3", "4", "Personalizada"];
const opcionesSiropes = ["Sirope...", "Sin Sirope", "Sirope Fresa", "Sirope Caramelo", "Sirope Chocolate"];
const opcionesEspuma = ["Opcion de Espuma","Sin Espuma", "Espuma Coco", "Espuma Vainilla", "Monin Fresa", "Monin Mango", "Monin Maracuya", "Monin Pitahaya", "Otra Espuma"];
const opcionesFrutas = ["Fruta...", "Sin Fruta", "Fresa", "Banano", "Arandano", "Sandia", "Melocoton", "Pitahaya"];
const opcionesSiropesCrepa = ["Sirope...", "Sin sirope", "Leche Condensada", "Nutella", "Sirope Caramelo", "Sirope Chocolate", "Sirope Dulce de Leche"];



function buscarProducto(nombre) {
    return productos.cafes.find(p => p.nombre === nombre) ||
        productos.frios.find(p => p.nombre === nombre) ||
        productos.especiales.find(p => p.nombre === nombre);
}


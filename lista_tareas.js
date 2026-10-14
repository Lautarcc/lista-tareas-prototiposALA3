const readline = require("readline");

//lista de tareas ejercicio 3

const ESTADOS = ["Pendiente", "En curso", "Terminada", "Cancelada"];
const DIFICULTADES = ["Fácil", "Medio", "Difícil"];

function formatearFecha(fecha) {
  return fecha.toLocaleDateString("es-AR");
}

function Tarea(titulo, descripcion, estado, vencimiento, dificultad) {
  this.titulo = titulo;
  this.descripcion = descripcion;
  this.estado = estado;
  this.fechaCreacion = new Date();
  this.vencimiento = vencimiento; 
  this.dificultad = dificultad;
}

Tarea.prototype.aTexto = function () {
  return [
    `Título: ${this.titulo}`,
    `Descripción: ${this.descripcion || "-"}`,
    `Estado: ${this.estado}`,
    `Creada: ${formatearFecha(this.fechaCreacion)}`,
    `Vence: ${this.vencimiento ? formatearFecha(this.vencimiento) : "Sin vencimiento"}`,
    `Dificultad: ${this.dificultad}`,
  ].join("\n");
};

Tarea.prototype.coincideConTitulo = function (texto) {
  return this.titulo.toLowerCase().includes(texto.toLowerCase());
};

function GestorDeTareas() {
  this.tareas = [];
}

GestorDeTareas.prototype.agregar = function (tarea) {
  this.tareas.push(tarea);
};

GestorDeTareas.prototype.obtenerTodas = function () {
  return this.tareas;
};

GestorDeTareas.prototype.filtrarPorEstado = function (estado) {
  return this.tareas.filter((tarea) => tarea.estado === estado);
};

GestorDeTareas.prototype.buscarPorTitulo = function (texto) {
  return this.tareas.filter((tarea) => tarea.coincideConTitulo(texto));
};

function Consola() {
  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

Consola.prototype.preguntar = function (texto) {
  return new Promise((resolve) => this.rl.question(texto, resolve));
};

Consola.prototype.cerrar = function () {
  this.rl.close();
};

Consola.prototype.pedirTextoObligatorio = async function (texto) {
  while (true) {
    const entrada = (await this.preguntar(texto)).trim();
    if (entrada !== "") return entrada;
    console.log("este dato es obligatorio.");
  }
};

Consola.prototype.pedirOpcionNumerica = async function (texto, min, max) {
  while (true) {
    const numero = Number((await this.preguntar(texto)).trim());
    if (Number.isInteger(numero) && numero >= min && numero <= max) {
      return numero;
    }
    console.log(`elija un número entre ${min} y ${max}.`);
  }
};

Consola.prototype.pedirFecha = async function (texto) {
  while (true) {
    const entrada = (await this.preguntar(texto)).trim();
    if (entrada === "") return null;
    const partes = entrada.split("/").map(Number);
    if (partes.length === 3) {
      const [dia, mes, anio] = partes;
      const fecha = new Date(anio, mes - 1, dia);
      if (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
      ) {
        return fecha;
      }
    }
    console.log("Fecha invalida. porfavr use el formato dd/mm/aaaa (o Enter para omitir).");
  }
};

function Aplicacion() {
  this.gestor = new GestorDeTareas();
  this.consola = new Consola();
}

Aplicacion.prototype.iniciar = async function () {
  let salir = false;
  while (!salir) {
    console.log("\n--- MENÚ PRINCIPAL ---");
    console.log("1. Ver mis tareas");
    console.log("2. Buscar una tarea");
    console.log("3. Agregar una tarea");
    console.log("0. Salir");
    const opcion = await this.consola.pedirOpcionNumerica("Opción: ", 0, 3);

    if (opcion === 1) await this.menuVer();
    else if (opcion === 2) await this.buscarTarea();
    else if (opcion === 3) await this.agregarTarea();
    else salir = true;
  }
  this.consola.cerrar();
  console.log("Hasta luego!");
};

Aplicacion.prototype.menuVer = async function () {
  let volver = false;
  while (!volver) {
    console.log("\n---VER TAREAS---");
    console.log("1. Todas");
    ESTADOS.forEach((estado, i) => console.log(`${i + 2}. ${estado}`));
    console.log("0. Volver");
    const opcion = await this.consola.pedirOpcionNumerica(
      "Opcion: ",
      0,
      ESTADOS.length + 1
    );

    if (opcion === 0) volver = true;
    else if (opcion === 1) this.mostrarLista(this.gestor.obtenerTodas());
    else this.mostrarLista(this.gestor.filtrarPorEstado(ESTADOS[opcion - 2]));
  }
};

Aplicacion.prototype.mostrarLista = function (tareas) {
  if (tareas.length === 0) {
    console.log("\nNo hay tareas para mostrar.");
    return;
  }
  tareas.forEach((tarea, i) => {
    console.log(`\n--- Tarea ${i + 1} ---`);
    console.log(tarea.aTexto());
  });
};

Aplicacion.prototype.buscarTarea = async function () {
  const texto = await this.consola.pedirTextoObligatorio("\nTitulo a buscar: ");
  this.mostrarLista(this.gestor.buscarPorTitulo(texto));
};

Aplicacion.prototype.agregarTarea = async function () {
  console.log("\n---NUEVA TAREA---");
  const titulo = await this.consola.pedirTextoObligatorio("Titulo: ");
  const descripcion = (await this.consola.preguntar("descripción (opcional): ")).trim();

  console.log("estado:");
  ESTADOS.forEach((estado, i) => console.log(`${i + 1}. ${estado}`));
  const iEstado = await this.consola.pedirOpcionNumerica("elija el estado: ", 1, ESTADOS.length);

  const vencimiento = await this.consola.pedirFecha(
    "vencimiento dd/mm/aaaa (enter para omitir): "
  );

  console.log("Dificultad:");
  DIFICULTADES.forEach((d, i) => console.log(`${i + 1}. ${d}`));
  const iDificultad = await this.consola.pedirOpcionNumerica(
    "elija la dificultad: ",
    1,
    DIFICULTADES.length
  );

  const tarea = new Tarea(
    titulo,
    descripcion,
    ESTADOS[iEstado - 1],
    vencimiento,
    DIFICULTADES[iDificultad - 1]
  );
  this.gestor.agregar(tarea);
  console.log("\n¡Tarea agregada!");
};

if (require.main === module) {
  new Aplicacion().iniciar();
}

module.exports = { Tarea, GestorDeTareas, Consola, Aplicacion };

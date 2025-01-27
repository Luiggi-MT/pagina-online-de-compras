// ./tienda.js
import express from "express";
import nunjucks from "nunjucks";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import connectDB from "./model/db.js";
import TiendaRouter from "./routes/router_tienda.js";
import UsuariosRouter from "./routes/router-usuarios.js";
import RatingRouter from "./routes/router_rating.js";
import jwt from "jsonwebtoken"; 
import flash from 'connect-flash';
import dotenv from 'dotenv';

connectDB();
const app = express();
// Middleware para parsear las cookies
app.use(cookieParser());
app.use(flash());
// Middlewares y rutas
app.use(express.urlencoded({ extended: true })); // Para procesar formularios
// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Middleware de autenticación
const autentificacion = (req, res, next) => {
  const token = req.cookies.access_token;

  if (token) {
    try {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.username = data.usuario;  // Asignar el username
      req.admin = data.admin;       // Asignar el rol de admin si corresponde
    } catch (error) {
      console.error('Token inválido:', error);
    }
  }

  next(); // Continúa con la ejecución de la siguiente ruta
};

// Usar el middleware en todas las rutas
app.use(autentificacion);

const IN = process.env.IN || 'development';

nunjucks.configure('views', {
  autoescape: true,
  noCache: IN == 'development',
  watch: IN == 'development',
  express: app
});

app.set('view engine', 'html');

app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'mi_clave_secreta',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static('public'));

// Inicializa el carrito en la sesión
const inicializarCarrito = (req) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
};

// test para el servidor
app.get("/hola", (req, res) => {
  res.send('Hola desde el servidor');
});

// Middleware para inicializar carrito
app.use((req, res, next) => {
  inicializarCarrito(req);
  next();
});

app.use(express.json())
// Las demás rutas con código en el directorio routes
app.use("/", TiendaRouter);
app.use("/usuarios", UsuariosRouter);
app.use("/api/ratings", RatingRouter);
app.use('/public', express.static('public'));


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

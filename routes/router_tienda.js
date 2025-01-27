// ./routes/router_tienda.js
import express from "express";
import Productos from "../model/productos.js";

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const productos = await Productos.find({});
    const carritoVacio = req.session.cart.length === 0;
    const usuario = req.username;  // Esto debe contener el username del usuario autenticado
    res.render('home.html', { productos, carritoVacio, usuario });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al cargar productos');
  }
});

  
router.get('/buscar', async (req, res) => {
  const searchQuery = req.query.query;
  const usuario = req.username; 
  // Buscar productos que coincidan con el término de búsqueda en el título o descripción
  const productos = await Productos.find({
    $or: [
      { title: { $regex: searchQuery, $options: 'i' } }, // Búsqueda en título (insensible a mayúsculas)
      { description: { $regex: searchQuery, $options: 'i' } } // Búsqueda en descripción
    ]
  });
  const carritoVacio = req.session.cart.length === 0;
  // Renderizar la página con los resultados de búsqueda
  res.render('home.html', { productos, carritoVacio, usuario });
});

router.get('/categoria/:categoria', async (req, res) => {
  const categoria = req.params.categoria;
  const usuario = req.username;  // Esto debe contener el username del usuario autenticado
  const productos = await Productos.find({ category: categoria });
  const carritoVacio = req.session.cart.length === 0;
  res.render('home.html', { productos, carritoVacio, usuario });
});

// Agregar un producto al carrito
router.post('/agregar-carrito', async (req, res) => {
  const { id } = req.body;
  try {
    const producto = await Productos.findOne({ id }); // Aquí asegúrate de que 'id' coincida con el que usas
    if (!producto) {
      return res.status(404).send('Producto no encontrado');
    }

    // Verifica si el producto ya está en el carrito
    const productoEnCarrito = req.session.cart.find(item => item.id === producto.id);
    if (!productoEnCarrito) {
      req.session.cart.push(producto); // Agrega el producto al carrito si no está ya
    }

    res.redirect('/'); // Redirige al usuario a la página principal
  } catch (err) {
    console.error('Error al buscar el producto:', err);
    res.status(500).send('Error al agregar el producto al carrito');
  }
});

// Mostrar el carrito
router.get('/carrito', (req, res) => {
  const { cart } = req.session;
  const usuario = req.body.usuario;
  res.render('carrito.html', { productos: cart, usuario}); // Renderiza una vista del carrito
});

// Eliminar producto del carrito
// Eliminar un producto del carrito
router.post('/eliminar-carrito', (req, res) => {
  const  { id }  = req.body;

  // Verifica si el carrito existe
  if (!req.session.cart) {
    req.session.cart = []; // Inicializa el carrito si no existe
  }

  // Elimina el producto del carrito
  req.session.cart = req.session.cart.filter(producto => producto.id != id);
  
  // Redirige al usuario a la página del carrito o donde desees
  const  carritoVacio = req.session.cart.length === 0; 
  if (carritoVacio) {
    res.redirect('/');
  } else {
    res.redirect('/carrito');
  }
});
router.get('/producto/:id/', async (req, res) => {
  const { id } = req.params;
  const usuario = req.username;
  const isAdmin = req.admin;
  try{
    const producto = await Productos.findOne({ id: id});
    if (producto){
      res.render('producto.html', { producto, usuario, isAdmin });  // Renderiza una vista del producto
    } else {
      res.status(404).send('Producto no encontrado')  // Si el producto no existe, muestra un error 404
    }
  }catch(error) {
    console.error('Error al buscar el producto' ,error)
    res.status(404).send('Error al buscar el producto')
  }
})

router.get('/producto/:id/editar', async (req, res) => {
  // Verifica si el usuario es un admin antes de mostrar el formulario
  if (!req.admin) {
    return res.status(403).send('Acceso no autorizado');
  }

  const { id } = req.params;
  console.log(id)
  try {
    const producto = await Productos.findOne({ id: id });
    if (producto) {
      res.render('editarProducto.html', { producto });
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error al buscar el producto:', error);
    res.status(500).send('Error al buscar el producto');
  }
});

router.post('/producto/:id/editar', async (req, res) => {
  // Verifica si el usuario es un admin antes de permitir la actualización
  if (!req.admin) {
    return res.status(403).send('Acceso no autorizado');
  }

  const { id } = req.params;
  const { title, price, description, category, image, rating } = req.body;

  try {
    const producto = await Productos.findOneAndUpdate(
      { id: id },
      { title, price, description, category, image, rating },
      { new: true }
    );

    res.redirect(`/producto/${producto.id}`);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).send('Error al actualizar el producto');
  }
});

router.post('/producto/:id/eliminar', async (req, res) => {
  // Verifica si el usuario es un admin antes de permitir la eliminación
  if (!req.admin) {
    return res.status(403).send('Acceso no autorizado');
  }

  const { id } = req.params;
  try {
    await Productos.deleteOne({ id: id });
    res.redirect('/');
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send('Error al eliminar el producto');
  }
});


export default router;

import express from "express";
import Productos from "../model/productos.js"; // Modelo del producto
import { console } from "inspector";

const router = express.Router();

// Obtener todos los ratings
router.get("/", async (req, res) => {
  const { desde = 0, hasta = 10 } = req.query;
  try {
    const productos = await Productos.find({}, "title rating")
      .skip(parseInt(desde))
      .limit(parseInt(hasta) - parseInt(desde));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los ratings" });
  }
});

// Obtener el rating de un producto por ID
router.get("/:id", async (req, res) => {
  try {

    const producto = await Productos.findOne({ _id: req.params.id });

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rating" });
  }
});

// PUT /api/ratings/:id - Modificar el rating de un producto por su ID o _id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rate, count } = req.body;

    if (rate < 0 || rate > 5) {
      return res.status(400).json({ error: 'El rating debe ser un número entre 0 y 5' });
    }
    const producto = await Productos.findOne({_id: id})
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const response = await Productos.updateOne({_id: id}, {$set: {"rating.rate": rate, "rating.count": count}}); 
    if (response)
      res.json(producto);
  } catch (error) {
    console.error("Error al actualizar el rating:", error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;

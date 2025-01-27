// ./model/productos.js
import mongoose from "mongoose";
 
const ProductosSchema = new mongoose.Schema({
  id: {
    "type": "Number",
    "unique": true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String, // Usamos String para almacenar URLs
    required: true
  },
  rating: {
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      required: true
    }
  }
})
const Productos = mongoose.model("productos", ProductosSchema);
export default Productos
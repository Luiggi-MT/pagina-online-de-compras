// ./model/usuarios.js
import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  name: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true }
  },
  phone: { type: String, required: true }, 
  admin: {
    type: Boolean,
    default: false,
    required: false
  },
  _v: {
    type: Number,
    default: 0
  }
});

const Usuarios =  mongoose.model('usuarios', usuarioSchema);

export default Usuarios;

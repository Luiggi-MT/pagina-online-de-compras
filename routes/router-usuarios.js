import express from 'express';
import Usuarios from '../model/usuarios.js';
import jwt from 'jsonwebtoken';

const router = express.Router();


// Para mostrar formulario de login
router.get('/login', (req, res)=>{
  res.render("login.html")
})

// Para recoger datos del formulario de login 
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const usuario = await Usuarios.findOne({ username: username });
    if (!usuario) {
      req.flash('error', 'Usuario no encontrado');
      res.render('login.html');
      return;
    }

    const match = password === usuario.password;
    if (!match) {
      req.flash('error', 'Contraseña incorrecta');
      res.render('login.html');
      return;
    }

    // Generar el JWT
    const token = jwt.sign({ usuario: usuario.username, admin: usuario.admin }, process.env.SECRET_KEY, { expiresIn: '1h' });

    // Enviar el token como cookie HTTP-only
    res.cookie('access_token', token, {
      httpOnly: true, 
      secure: process.env.IN === 'production', 
      sameSite: 'Strict', 
      maxAge: 60 * 60 * 1000 
    });

    req.flash('success', 'Bienvenido ' + usuario.username);
    res.render('bienvenida.html', { usuario });
  } catch {
    req.flash('error', 'Error al iniciar sesión');
    res.render('login.html');
  }
});


router.get('/logout', (req, res) => {
    const usuario = req.username 
    res.clearCookie('access_token').render("despedida.html", {usuario})
}); 

export default router;
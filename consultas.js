//consultas.js 
import { MongoClient } from 'mongodb'  
console.log( '🏁 consultas.js ----------------->')

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
  
const url    = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

//Database Name
const dbName = 'myProject'; 

async function main() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");

        const db = client.db(dbName); // Cambia 'myProject' si es necesario
        const collection = db.collection('productos');

        // Prueba todos los productos 
        const productos = await collection.find({}).toArray();
        console.log("Todos los productos:", productos);
        // 1. Productos de más de 100 $
        const productosCaros = await collection.find({ price:{ $gt: 100 }}).toArray();
        console.log("Productos de más de 100 $:", productosCaros);

        // 2. Productos que contengan 'winter' en la descripción, ordenados por precio
        const productosWinter = await collection.find({ description: /winter/i }).sort({ price: 1 }).toArray();
        console.log("Productos con 'winter' en la descripción:", productosWinter);

        // 3. Productos de joyería ordenados por rating
        const productosJoyeria = await collection.find({ category: "jewelery" }).sort({ 'rating.rate': -1 }).toArray();
        console.log("Productos de joyería ordenados por rating:", productosJoyeria);

        // 4. Reseñas totales (count en rating)
        const totalResenas = await collection.aggregate([
            { $group: { _id: null, totalCount: { $sum: "$rating.count" } } }
        ]).toArray();
        console.log("Reseñas totales:", totalResenas[0].totalCount);

        // 5. Puntuación media por categoría de producto
        const puntuacionMedia = await collection.aggregate([
            {
                $group: {
                    _id: "$category",
                    promedioRating: { $avg: "$rating.rate" }
                }
            }
        ]).toArray();
        console.log("Puntuación media por categoría:", puntuacionMedia);

        // 6. Usuarios sin dígitos en el password (suponiendo que tienes una colección de usuarios)
        const usuariosCollection = db.collection('usuarios'); // Cambia si es necesario
        const usuariosSinDigitos = await usuariosCollection.find({ password: { $not: /\d/ } }).toArray();
        console.log("Usuarios sin dígitos en el password:", usuariosSinDigitos);

    } catch (err) {
        console.error("Error en las consultas:", err);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
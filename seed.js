// seed.js
import { MongoClient } from 'mongodb'
  
console.log( '🏁 seed.js ----------------->')

// del archivo .env
const USER_DB = process.env.USER_DB
const PASS    = process.env.PASS
  
const url    = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

  
// Database Name
const dbName = 'myProject';
  
// función asíncrona
async function Inserta_datos_en_colección (colección, url) {
                                  
  try {
    const datos = await fetch(url).then(res => res.json())
    console.log(datos)
     // ... Insertar datos en la BD aquí
    await client.connect();

    const db = client.db(dbName);

    const collection = db.collection(colección);

    // Insertar datos en la colección
    const resultado = await collection.insertMany(datos);
    
    console.log(`${resultado.insertedCount} documentos insertados en la colección ${colección}`);

   

    return `${datos.length} datos traidos para ${colección}`

  } catch (err) {
      err.errorResponse += ` en fetch ${colección}`
      throw err    
  }finally{
    await client.close();
    console.log('Conexión cerrada con la base de datos')
  }
}

Inserta_datos_en_colección('productos', 'https://fakestoreapi.com/products')
   .then((r)=>console.log(`Todo bien: ${r}`))                                 // OK
   .then(()=>Inserta_datos_en_colección('usuarios', 'https://fakestoreapi.com/users'))
   .then((r)=>console.log(`Todo bien: ${r}`))                                // OK
   .catch((err)=>console.error('Algo mal: ', err.errorResponse))             // error
  

console.log('Lo primero que pasa')


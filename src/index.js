// Servidor Express

// Para probar los ficheros estáticos del fronend, entrar en <http://localhost:4500/>
// Para probar el API, entrar en <http://localhost:4500/api/items>

// Imports

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require('dotenv').config()



// Arracar el servidor

const server = express();

// Configuración del servidor

server.use(cors());
server.use(express.json({limit: "25mb"}));




// Conexion a la base de datos

async function getConnection() {
  const connection = await mysql.createConnection(
    {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS,  // <-- Pon aquí tu contraseña o en el fichero /.env en la carpeta raíz
      database: process.env.DB_NAME || "Adakiteen",
    }
  );

  connection.connect();

  return connection;
}



// Poner a escuchar el servidor

const port = process.env.PORT || 4500;
server.listen(port, () => {
  console.log(`Ya se ha arrancado nuestro servidor: http://localhost:${port}/`);
});



// Endpoints

// GET /api/kittens/:user
//obtener el lsitado de todos los gatitos donde user es el parametro que especifica el usuario y solo devolver lods gatos de ese usuario.

server.get("/api/kittens/:user", async (req, res) => {
  const user = req.params.user;

  const select = "SELECT * FROM Kitten WHERE owner = ?";

  const conn = await getConnection();

  const [result] = await conn.query(select, user); // las dos constantes(la query y los params)

  console.log(result);

  conn.end();

  res.json ({
    info: {
        count: result.length, //número de elementos del listado.Si pidiera mas resultados 
    },
    results: result //listado de gatitos
})
});



// POST /api/kittens/:user
// insertar un nuevo gatito donde user es el usuario que esta insertando el gatito.Tambien se espera por el body de la peticion toda la info del gato a insertar.Devolver la respuesta si es exitoxa o no.

server.post("/api/kittens/:user", async (req, res) => {
  const user = req.params.user;
  const newKitten = req.body;
  try{

  const insert = "INSERT INTO Kitten (`owner`, url, name, race, `desc`) VALUES (?, ?, ?, ?, ?);";
  const conn = await getConnection();
  const [result] = await conn.query(insert, [user, newKitten.url, newKitten.name, newKitten.race, newKitten.desc]); // Cogemos la constante de la query, cogemos la constante de el user y la constante de newKitten con sus respectivas propiedades que vienen del front y qfue coinciden con las columnas de nuestra BD
  conn.end();

  res.json ({
      success: true //Puede ser true o false
  });
  } catch (error) {
    res.json ({
      success: false,//Puede ser true o false
      message: error,
  });
  }
});

//PUT /api/kittens/:user/:kitten_id
// Actualizar un gatito, donde user es el parametro que especifica el usuario al que se actualiza el gato y kitten_id es el identificador del gato a actualizar.Tambien se espera por el body toda la info del gato.Devolver la respuesta si es exitosa o no.
server.put("/api/kittens/:user/:kitten_id", async (req, res) => {
  const user = req.params.user;
  const kittenId = req.params.kitten_id;
  const {url, name, race, desc} = req.body;// hacemos destructurin del objeto(como arriba en newKitten.url, newKitten.name....)
  try{

  const update = "UPDATE Kitten SET url= ?, name= ?, race= ?, `desc`= ? WHERE id = ?";
  const conn = await getConnection();
  const [result] = await conn.query(update, [url, name, race, desc, kittenId]);
  conn.end();

  res.json ({
      success: true //Puede ser true o false
  });
  } catch (error) {
    res.json ({
      success: false,//Puede ser true o false
      message: error,
  });
  }
});

//DELETE /api/kittens/:user/:kitten_id
//Eliminar un gatito donde user es el parametro que especifica que usuario está eliminando el gato y el kitten_id es el identificador del gato a eliminar. Devolver la respuesta si fue exitosa o no.
server.delete("/api/kittens/:user/:kitten_id", async (req, res) => {
  const user = req.params.user;
  const kittenId = req.params.kitten_id;
  try{

  const deleteSql = "DELETE FROM Kitten WHERE id= ? and owner= ?";
  const conn = await getConnection();
  const [result] = await conn.query(deleteSql, [kittenId, user]);//Debemos poner el mismo orden de las contantes como en la sentencia sql
  conn.end();

  res.json ({
      success: true //Puede ser true o false
  });
  } catch (error) {
    res.json ({
      success: false,//Puede ser true o false
      message: error,
  });
  }
});

// Serv estáticos

server.use(express.static("./src/public_html"));

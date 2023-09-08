//LA INSTALAMOS CON npm install zod -E
const zod = require('zod')

//CREAMOS UN ESQUEMA DE LA PELICULA

//con esto podemos ir haciendo validaciones
const movieSchema = zod.object({
  //tambien podemos tener informacion de cual es el error ,
  //asi que se le puede pasar opciones, para que cuando ocurra un error, nos de ese error
  title: zod.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movit title is required',
  }),
  //con el año no solo es necesario que sea un numero
  //lo piola de esto, es que se tienen validaciones en cadena, porque un numero tambien
  //puede ser un decimal
  year: zod.number().int().positive().min(1900).max(2024), // aunque al poner el rango podemos quitar lo de positivo,
  director: zod.string(),
  duration: zod.number().int().positive(),
  rate: zod.number().min(0).max(10).default(5.5)/*valor por defecto*/,
  poster: zod.string().url({
    message: 'Poster bust be a valid URL'
  }),
  genre: zod.array(
    zod.enum([
      'Action',
      'Adventure',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Thriller',
      'Sci-Fi',
      'Crime'
    ]),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  ),
});

const validateMovie = (movie) => {
  // el safeparse lo que hace es devolverte un objeto result que nos va a decir, si hay un error
  //o si hay datos

  //este ejemplo fue sacado de la documentacion de zod
  /**
   * stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse("billie");
// => { success: true; data: 'billie' }
   */
  return movieSchema.safeParse(movie);
};


/**
 * Si estás utilizando safeparse de Zod para validar el cuerpo de la solicitud en Express, 
 * la función safeparse NO LANZARA UNA EXCEPCION (ESTO ES MUY IMPORTANTE PORQUE LAS APIS
 *  DEBEN SER ROBUSTAS Y NO PUEDEN "PETAR" POR CUALQUIER COSA, LAS APIS DEBERIAN 
 * ACEPTAR DE TODO Y QUE NO REVIENTEN, OBVIAMENTE LUEGO LAS PROCESAN, PERO NO PUEDEN SER
 * EXQUISITAS EN LO QUE LE PASAS ) si se encuentran atributos adicionales en 
 * el cuerpo de la solicitud que no están definidos en el esquema. En su lugar, safeparse 
 * simplemente ignorará los atributos adicionales y te devolverá un objeto con los atributos 
 * que cumplan con el esquema definido.
 */


/**----------------------------------------------------------------- */


//puede querer cambiar algunas o todas las propiedades de una pelicula por 
//lo que tambien necesitan ser validades, pero midu dice que podriamos llamarlo "input" 
//en ambas validaciones, porque no sabemos si.. si o si tenemos una movie o no

const validatePartialMovie=(input)=>{
  return movieSchema.partial().safeParse(input);
  //esto de partial lo que va a hacer es que todo y cada una de las propiedades, las van a 
  //hacer opcionales de forma que si no estan, no pasa nada , pero si esta.. la valida como 
  //se supone que la tiene que validar y asi REAPROVECHAMOS TODO EL ESQUEMA para la 
  //actualizacion de la pelicula
}
module.exports = {
  validateMovie,
  validatePartialMovie 
};
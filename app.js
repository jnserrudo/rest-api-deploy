//utilizamos require porque por ahora estamos usando commonjs
const express=require('express') //require -->commonJS
const movies=require('./movies.json')

const {validateMovie, validatePartialMovie} =require('./schemas/movies.js')
const zod= require('zod')

//express tiene una biblioteca nativa , que ademas es parte de la plataforma web
//que  ya te pérmite crear ids unicas
const crypto=require('node:crypto')
const { error } = require('node:console')


const app=express()

app.disable('x-powered-by')

app.use(express.json())//con este middleware podemos acceder a los body de los request

app.get( '/',(req,res)=>{
    let obj={
        message:'Hola mundo'
    }
    res.json(obj)
})


const ACCEPTED_ORIGINS=[
    'http://localhost:8080',
    'http://localhost:1234',
    'http://moviesdea.com',
    'http://jnsix.com'

]

//Todos los recursos que sean MOVIES  se identifican con /movies
// se tiene una url que identifica a este recurso
app.get('/movies',(req,res)=>{
    //al poner un * estamos diciendo que todos los origenes que no sean nuestro propio origen
    //estan permitidos 
    //res.header('Access-Control-Allow-Origin','*')//pero podemos poner los origenes que queramos que tengan acceso como http://localhost:8080

    //tambien se puede de esta forma, para poder especificar cual origin queremos que sea, a traves de unos que podamos definir, por ejemplo en un array

    //podemos tomar el origen de la request o solicitud
    const origin=req.header('origin')
    //el unico caso en el cual navegador no devuelve el origin, es cuando la peticion es del mismo origin
    //osea no enviara la cabecera de origin, porque no tiene sentido, no es un CORS, su propio origen, siempre estqa disponible
    if(ACCEPTED_ORIGINS.includes(origin)||!origin){
        res.header('Access-Control-Allow-Origin',origin)

    }

    const {genero}=req.query
    if(genero){
        const pelisGenero=movies.filter(mov=>mov.genre.map(m=>m.toLowerCase()).includes(genero.toLocaleLowerCase()))
        pelisGenero.length>0 ? res.json(pelisGenero): res.json({message:'There arent Movie with the genre'+genero})
        
    }   
    else{
        res.json(movies)
    }
    

})

app.get('/movies/:id',(req,res)=>{ //path to rege xp
    

    const {id}=req.params

    const movie=movies.find(m=>m.id==id)
    if(movie)return res.json(movie)
    return res.status(404).json({message:'Movie not found'})


})

//el MIDDLEWARE CAPTURA ESAS REQUEST Y DETECTA SI TIENE QUE HACER UNA TRANSFORMACION PARA QUE 
//SE PUEDA ACCEDER DESDE EL REQ.BODY y tener acceso al objeto que estamos enviando en el body 
// de la request

app.post('/movies',(req,res)=>{
    //se pone la misma ruta, porque es el MISMO RECURSO. EL RECURSO SE IDENTIFICA 
    //SIEMPRE CON LA MISMA URL, PORQUE SON LOS VERBOS(METODOS(GET,PUT)) LOS QUE DEFINEN LAS 
    //OPERACIONES

    //para que el req.body funcione debemos  ejecutar el middleware de express.json
    const result=validateMovie(req.body)

    if(result.error){
        //tambien se podria usar el 422 Unprocessable Entity
        return res.status(400).json( {error: JSON.parse(result.error.message)})
    }


    const {title,year,director,duration,poster,genre,rate}=req.body

    /**Esto no seria REST (el hacer el movies.push.. ), porque estamos guardando el estado de la aplicacion en memoria (en el json de las movies) y no en bd
     * 
     */


    /* const newMovie={
        id:crypto.randomUUID(),   // esto crea un uuid v4
        title,
        genre,
        director,
        year,
        duration,
        rate:rate??0,
        poster
    } */
    //el problema con esto es que no se hace ningun tipo de validacion


    const newMovie={
        id:crypto.randomUUID(),   // esto crea un uuid v4
        ...result.data//aca si podriamos hacer esto, puesto que ya no es peligroso, ya esta validado
    }

    movies.push(newMovie)
    /**
     *con el codigo 201(created) no es necesario devolver algo, a veces se suele devolver el mismo 
     recurso que se creo para actualizar la cache del cliente, asi ya tenemos el nuevo, porque
     en este caso le agregamos la id, evitandome crear otra request 

     */
    res.status(201).json(newMovie)
})

app.delete('/movies/:id',(req,res)=>{

    const origin=req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)||!origin){
        res.header('Access-Control-Allow-Origin',origin)
        
    }

    const {id}=req.params
    const movieIndex=movies.findIndex(movie=>movie.id==id)

    if(movieIndex<0){
        return res.status(404).json({message:'Movie not found'})
    }

    movies.splice(movieIndex,1)
    return res.json({message:'Movie deleted'})

})


app.options('/movies/:id',(req,res)=>{

    const origin=req.header('origin')
    if(ACCEPTED_ORIGINS.includes(origin)||!origin){
        res.header('Access-Control-Allow-Origin',origin)
        //EN EL CASO DE OPTION, DEBEMOS ESPECIFICAR LOS METODOS PERMITIDOS
        res.header('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE')
    }

    res.send(200)

})

app.patch('/movies/:id',(req,res)=>{
    
    const result=validatePartialMovie(req.body)
    if(result.error){
        res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const {id}=req.params

    const movieIndex=movies.findIndex(movie=>movie.id=id)
// agarramos el index ya que nos servira tambien para ubicar a la peli
    if(movieIndex<0){
        return res.status(404).json({message:'Movie not found'})
    }

    const updatedMovie={
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex]=updatedMovie

    return res.json(updatedMovie)

})

//siempre debemos utilizar como puerto, la variable de entorno del proceso
//LAS VARIABLES DE ENTORNO SIEMPRE SON EN MAYUSCULAS 

/**
 * En el hosting, cuando vayamos a hospedar nuestra api, debemos dejar el hosting nos diga el puerto y nos dice por variable de entorno
 */

const PORT= process.env.PORT??1234

app.listen(PORT,()=>{
    console.log('servidor escuchando en el puerto  http://localhost:1234')
})
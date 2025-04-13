import { Sequelize } from "sequelize-typescript"

const sequelize = new Sequelize({
    database : process.env.DB_NAME,
    dialect : 'mysql',
    host : process.env.DB_HOST,
    password : process.env.DB_PASSWORD,
    username : process.env.DB_USERNAME,
    port : Number(process.env.DB_PORT),
    models : [__dirname + '/models/*.{ts,js}']
})

sequelize.authenticate()
.then(() => console.log('Database connected'))
.catch(err => console.log('Error connecting to database', err))

sequelize.sync({force : false}).then(()=>{
    console.log("synced!!")  
})


export default sequelize
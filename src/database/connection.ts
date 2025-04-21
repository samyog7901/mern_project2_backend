import { Sequelize } from "sequelize-typescript"
import User from "./models/userModel"
import Product from "./models/productModel"
import Category from "./models/Category"
import Cart from "./models/Cart"

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

// Relationships
User.hasMany(Product,{foreignKey : 'userId'})
Product.belongsTo(User,{foreignKey : 'userId'})

Category.hasOne(Product,{foreignKey : 'categoryId'})
Product.belongsTo(Category,{foreignKey : 'categoryId'})


// user-cart relation
User.hasMany(Cart, { foreignKey: 'userId' })
Cart.belongsTo(User, { foreignKey: 'userId' })

// product-cart relation
Product .hasMany(Cart, { foreignKey: 'productId' })
Cart.belongsTo(Product, { foreignKey: 'productId' })




export default sequelize
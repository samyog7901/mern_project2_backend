import { Sequelize } from "sequelize-typescript"
import User from "./models/userModel"
import Product from "./models/productModel"
import Category from "./models/Category"
import Cart from "./models/Cart"
import Order from "./models/Order"
import OrderDetail from "./models/OrderDetails"
import Payment from "./models/Payment"
import adminSeeder from "../adminSeeder"
import categoryController from "../controllers/categoryController"

const sequelize = new Sequelize(process.env.DATABASE_URL!,{
    // database : process.env.DB_NAME,
    dialect : 'mysql',
    dialectOptions : {
        ssl: {
            // require: true,
            rejectUnauthorized: false
        }
    },

    // host : process.env.DB_HOST,
    // password : process.env.DB_PASSWORD || '',
    // username : process.env.DB_USERNAME,
    // port : Number(process.env.DB_PORT),
    // dialectOptions: {
    //     socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock'
    // },
    models : [User, Product, Category, Cart, Order, OrderDetail, Payment],
    logging : false
})

sequelize.authenticate()
.then(() => console.log('Database connected'))
.catch(err => console.log('Error connecting to database', err))

sequelize.sync({alter : true}).then(async()=>{
    console.log("synced!!")
    await adminSeeder();
    await categoryController.seedCategory();
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

// order-orderdetail relation
Order.hasMany(OrderDetail,{foreignKey : 'orderId'})
OrderDetail.belongsTo(Order,{foreignKey : 'orderId'})

//orderdetail-product relation
Product.hasMany(OrderDetail,{foreignKey : 'productId'})
OrderDetail.belongsTo(Product,{foreignKey : 'productId'})

// order-payment relation
Payment.hasOne(Order,{foreignKey : 'paymentId'})
Order.belongsTo(Payment,{foreignKey : 'paymentId'})

// order-user relation

User.hasMany(Order,{foreignKey : 'userId'})
Order.belongsTo(User,{foreignKey : 'userId'})




export default sequelize
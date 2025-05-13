import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript'
import Order from './Order'
import Product from "./productModel"

@Table({
  tableName: 'orderdetails',
  modelName: 'OrderDetail',
  timestamps: true
})
class OrderDetail extends Model {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare quantity: number


  @ForeignKey(() => Order)
  @Column(DataType.UUID)
  declare orderId: string

  @BelongsTo(() => Order)
  declare order: Order

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  declare productId: string

  @BelongsTo(() => Product)
  declare product: Product
}

export default OrderDetail

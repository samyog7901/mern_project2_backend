
import {Table,Column,Model,DataType,CreatedAt, PrimaryKey} from 'sequelize-typescript'

@Table({
    tableName:'products',
    modelName :'Product',
    timestamps : true
})

class Product extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4

    })
    declare id: string

    @Column({
        type : DataType.STRING,
        allowNull : false
    })
    declare productName: string

    @Column({
        type : DataType.TEXT
    })
    declare description: string

    @Column({
        type : DataType.DOUBLE
    })
    declare price: number

    @Column({
        type : DataType.INTEGER
    })
    declare stockQty: number

    @Column({
        type : DataType.STRING
    })
    declare imageUrl: string

}

export default Product
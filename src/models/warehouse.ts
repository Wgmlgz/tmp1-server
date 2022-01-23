import mongoose from 'mongoose'

export interface IWarehouse {
  name: string
  descriptrion?: string
}

const WarehouseSchema = new mongoose.Schema<IWarehouse>({
  name: {
    type: String,
    required: true,
  },
  descriptrion: {
    type: String,
  },
})

const WarehouseModel = mongoose.model('Warehouse', WarehouseSchema)

export default WarehouseModel

import mongoose from 'mongoose'

export interface IWarehouse {
  name: string
  descriptrion?: string
  undeletable?: boolean
}

const WarehouseSchema = new mongoose.Schema<IWarehouse>({
  name: {
    type: String,
    required: true,
  },
  descriptrion: {
    type: String,
  },
  undeletable: {
    type: Boolean,
  },
})

const WarehouseModel = mongoose.model('Warehouse', WarehouseSchema)

export default WarehouseModel

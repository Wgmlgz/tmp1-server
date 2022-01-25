import mongoose from 'mongoose'

export interface IRemain {
  product: string
  warehouse: string
  quantity: number
}

const RemainSchema = new mongoose.Schema<IRemain>({
  product: {
    type: String,
    required: true,
  },
  warehouse: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
})

const RemainModel = mongoose.model('Remain', RemainSchema)

export default RemainModel

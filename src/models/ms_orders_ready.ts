import mongoose from 'mongoose'

export interface IMsOrdersReady {
  mirishop_id: string
  status: string
  date: Date
  summ: number
  content: { sku_id: string; quantity: number }[]
}

const MsOrdersReady = new mongoose.Schema<IMsOrdersReady>({
  mirishop_id: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  summ: {
    type: Number,
    required: true,
  },
  content: {
    type: [
      {
        sku_id: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    required: true,
  },
})

const MsOrdersReadyModel = mongoose.model('msOrdersReady', MsOrdersReady)

export default MsOrdersReadyModel

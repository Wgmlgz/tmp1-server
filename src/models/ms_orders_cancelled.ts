import mongoose from 'mongoose'

export interface IMsOrdersCancelled {
  mirishop_id: string
  status: string
  date: Date
  summ: number
  content: { sku_id: string; quantity: number }[]
}

const MsOrdersCancelled = new mongoose.Schema<IMsOrdersCancelled>({
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

const MsOrdersCancelledModel = mongoose.model('msOrdersCancelled', MsOrdersCancelled)

export default MsOrdersCancelledModel

import mongoose from 'mongoose'

export interface IMsOrdersDone {
  mirishop_id: string
  status: string
  date: Date
  summ: number
  content: { sku_id: string; quantity: number }[]
}

const MsOrdersDone = new mongoose.Schema<IMsOrdersDone>({
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

const MsOrdersDoneModel = mongoose.model('msOrdersDone', MsOrdersDone)

export default MsOrdersDoneModel

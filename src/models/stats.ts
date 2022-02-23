import mongoose from 'mongoose'

export interface IStats {
  product: string
  amount: number
  platform: string
  date: Date
}

const StatsSchema = new mongoose.Schema<IStats>({
  product: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
})

const StatsModel = mongoose.model('Stats', StatsSchema)

export default StatsModel

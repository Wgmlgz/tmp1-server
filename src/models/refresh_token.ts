import mongoose from 'mongoose'
import { REFRESH_TOKEN_EXPIRES } from '../config/env'

export interface IRefreshToken {
  token: string
}

const RefreshTokenSchema = new mongoose.Schema({
  token: String,
  expireAt: {
    type: Date,
    default: Date.now,
    index: { expires: REFRESH_TOKEN_EXPIRES },
  },
})

export default mongoose.model('RefreshToken', RefreshTokenSchema)

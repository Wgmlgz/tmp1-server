import mongoose from 'mongoose'

export interface IUser {
  id: string
  email: string
  password: string
  admin: boolean
  super_admin: boolean
  content_manager: boolean
  columns_settings?: Map<string, Map<string, boolean>>
}

const UserSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    required: true,
  },
  super_admin: {
    type: Boolean,
    required: true,
  },
  content_manager: {
    type: Boolean,
    required: true,
  },
  columns_settings: {
    type: Map,
    of: {
      type: Map,
      of: Boolean,
    },
  },
})

const UserModel = mongoose.model('User', UserSchema)

export default UserModel

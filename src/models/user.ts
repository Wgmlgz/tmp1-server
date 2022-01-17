import mongoose from 'mongoose'

export interface IUser {
  email: string
  password: string
  admin: boolean
  super_admin: boolean
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
})

const UserModel = mongoose.model('User', UserSchema)

export default UserModel

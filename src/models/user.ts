import mongoose from 'mongoose'

export interface IUser {
  email: string
  password: string
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
})

const UserModel = mongoose.model('User', UserSchema)

export default UserModel

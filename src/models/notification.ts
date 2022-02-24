import mongoose from 'mongoose'

export interface INotification {
  product: string
  warehouse: string
  date: Date
}

const NotificationSchema = new mongoose.Schema<INotification>({
  product: {
    type: String,
    required: true,
  },
  warehouse: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
})

const NotificationModel = mongoose.model('Notification', NotificationSchema)

export default NotificationModel

import mongoose, { Schema } from 'mongoose'

const SettingsSchema = new mongoose.Schema<{ data: any }>({
  data: {
    type: Schema.Types.Mixed,
  },
})

const SettingsModel = mongoose.model('Settings', SettingsSchema)

export default SettingsModel

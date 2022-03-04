import SettingsModel from '../models/settings'

const default_settings = {
  sender_warehouse: '61eda2d7f1a680d8e9adea70',
  send_cron: '*/10 * * * *',
  send_cron_enabled: true,
  update_orders_cron: '*/8 * * * *',
  update_orders_cron_enabled: true,
  api_key:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NJRCI6ImE1Y2ZmMTE0LTFkZDktNDRhNy1iNzc1LWY4NDNiYWYxMjUzMiJ9.Q1MURJ627ZSoJhIaYBogFEA27SvQO5LRaXjPfpptQVU',
}
export const readSettings: () => any = async () => {
  const obj = await SettingsModel.findOne({})
  if (obj && obj.data) return obj.data

  const new_settings = new SettingsModel({ data: default_settings })
  await new_settings.save()
  return (await SettingsModel.findOne({}))?.data
}

export const writeSettings = async (settings: any) => {
  const obj = await SettingsModel.findOne({})
  if (!obj) {
    const new_settings = new SettingsModel({ data: default_settings })
    await new_settings.save()
  }
  await SettingsModel.findOneAndUpdate({}, { data: settings })
}

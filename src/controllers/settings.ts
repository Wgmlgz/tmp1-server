import SettingsModel from '../models/settings'

export const default_settings: any = {
  sender_warehouse: '61eda2d7f1a680d8e9adea70',
  update_stocks: '*/10 * * * *',
  update_stocks_enabled: true,
  update_orders: '*/8 * * * *',
  update_orders_enabled: true,
  update_prices: '*/8 * * * *',
  update_prices_enabled: true,
  update_json: '*/8 * * * *',
  update_json_enabled: true,
  api_key:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NJRCI6ImE1Y2ZmMTE0LTFkZDktNDRhNy1iNzc1LWY4NDNiYWYxMjUzMiJ9.Q1MURJ627ZSoJhIaYBogFEA27SvQO5LRaXjPfpptQVU',
}
export const readSettings = async (str: string) => {
  const obj = await SettingsModel.findOne({})

  if (obj && obj.data) return obj.data[str] ?? default_settings[str]

  const new_settings = new SettingsModel({ data: default_settings })
  await new_settings.save()

  return (await SettingsModel.findOne({}))?.data[str] ?? default_settings[str]
}

export const readSettingsAll = async () => {
  const obj = await SettingsModel.findOne({})

  if (obj && obj.data) return obj.data ?? default_settings

  const new_settings = new SettingsModel({ data: default_settings })
  await new_settings.save()

  return (await SettingsModel.findOne({}))?.data ?? default_settings
}

export const writeSettings = async (settings: any) => {
  console.log(settings)

  const obj = await SettingsModel.findOne({})
  if (!obj) {
    const new_settings = new SettingsModel({ data: default_settings })
    await new_settings.save()
  }
  await SettingsModel.findOneAndUpdate({}, { data: settings })
}

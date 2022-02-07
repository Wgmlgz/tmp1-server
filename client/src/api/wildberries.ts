import axios from 'axios'
import { url } from './api'

export const wildberries_url = `${url}/api/wildberries`

export const getWildBerriesProducts = () =>
  axios.get(`${wildberries_url}/products`, {})

export const getWildberriesOrders = (
  status: number,
  date_start: string,
  take: number,
  skip: number
) =>
  axios.get(`${wildberries_url}/orders`, {
    params: { status, date_start, take, skip },
  })

export const updateWildberriesSettings = (
  sender_warehouse: string,
  send_cron: string
) => axios.post(`${wildberries_url}/settings`, { sender_warehouse, send_cron })

export const runUpdateWildberriesStocks = () =>
  axios.post(`${wildberries_url}/update`, {})

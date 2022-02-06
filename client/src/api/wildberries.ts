import axios from 'axios'
import { url } from './api'

export const wildberries_url = `${url}/api/wildberries`

export const getWildBerriesProducts = () =>
  axios.get(`${wildberries_url}/products`, {})

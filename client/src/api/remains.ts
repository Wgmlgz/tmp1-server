import axios from 'axios'
import { url } from './api'

export const remains_url = `${url}/api/remains`

export const getRemains = () => axios.get(`${remains_url}`)

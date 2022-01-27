import axios from 'axios'
import { IProductMove } from '../app_components/warehouses/ProductsMoveForm'
import { url } from './api'

export const products_move_url = `${url}/api/products_move`

export const getProductsMove = () => axios.get(`${products_move_url}`)
export const createProductMove = (product_out: IProductMove) =>
  axios.post(`${products_move_url}`, product_out)
export const updateProductMove = (id: string, product_out: IProductMove) =>
  axios.patch(`${products_move_url}/${id}`, product_out)
export const removeProductMove = (id: string) =>
  axios.delete(`${products_move_url}/${id}`)

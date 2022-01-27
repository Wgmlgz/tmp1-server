import axios from 'axios'
import { IProductOut } from '../app_components/warehouses/ProductsOutForm'
import { url } from './api'

export const products_out_url = `${url}/api/products_out`

export const getProductsOut = () => axios.get(`${products_out_url}`)
export const createProductOut = (product_out: IProductOut) =>
  axios.post(`${products_out_url}`, product_out)
export const updateProductOut = (id: string, product_out: IProductOut) =>
  axios.patch(`${products_out_url}/${id}`, product_out)
export const removeProductOut = (id: string) =>
  axios.delete(`${products_out_url}/${id}`)

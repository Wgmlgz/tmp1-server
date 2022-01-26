import axios from 'axios'
import { IProductIn } from '../app_components/warehouses/ProductsInForm'
import { url } from './api'

export const products_in_url = `${url}/api/products_in`

/** Warehouses */
export const getProductsIn = () => axios.get(`${products_in_url}`)
export const createProductIn = (product_in: IProductIn) =>
  axios.post(`${products_in_url}`, product_in)
export const updateProductIn = (id: string, product_in: IProductIn) =>
  axios.patch(`${products_in_url}/${id}`, product_in)
export const removeProductIn = (id: string) =>
  axios.delete(`${products_in_url}/${id}`)

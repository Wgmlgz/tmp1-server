import axios from 'axios'
import { ICategory } from '../app_components/categories/Categories'
import { IProduct } from '../app_components/products/ProductsForm'

export const url = process.env.REACT_APP_SERVER_URL
export const auth_url = `${url}/api/auth`
export const user_url = `${url}/api/user`
export const super_admin_url = `${url}/api/super_admin`
export const categories_url = `${url}/api/categories`
export const products_url = `${url}/api/products`

axios.interceptors.request.use(
  config => {
    config.withCredentials = true
    if (!config.url || !config.headers)
      throw new Error('config.url or config.headers are undefined')
    return config
  },
  error => Promise.reject(error)
)

const createAxiosResponseInterceptor = () => {
  const interceptor = axios.interceptors.response.use(
    response => response,
    async error => {
      if (error.response.status !== 401) return Promise.reject(error)
      axios.interceptors.response.eject(interceptor)
      return refreshToken()
        .then(res => axios(error.response.config))
        .catch(err => Promise.reject(err))
        .finally(createAxiosResponseInterceptor)
    }
  )
}
createAxiosResponseInterceptor()

export const getUser = () => axios.get(`${user_url}/user`)

export const superAdminGetUsers = () => axios.get(`${super_admin_url}/users`)
export const superAdminUpdateUser = (id: string, admin: boolean) =>
  axios.patch(`${super_admin_url}/update_user`, { id, admin })

export const login = (email: string, password: string) =>
  axios.post(`${auth_url}/login`, { email, password })
export const logout = () => axios.post(`${auth_url}/logout`, {})
export const register = (email: string, password: string) =>
  axios.post(`${auth_url}/register`, { email, password })
export const refreshToken = () => axios.post(`${auth_url}/token`, {})

export const getCategories = () => axios.get(`${categories_url}`)
export const removeCategory = (id: string) =>
  axios.delete(`${categories_url}/${id}`)
export const createCategory = (category: ICategory) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  let fd = new FormData()
  category.img && fd.append('file', category.img)
  category.name && fd.append('name', category.name)
  category.descriptrion && fd.append('descriptrion', category.descriptrion)
  category.tags && fd.append('tags', JSON.stringify(category.tags))
  category.parent && fd.append('parent', category.parent)
  return axios.post(`${categories_url}`, fd, config)
}

export const getProducts = () => axios.get(`${products_url}`)
export const removeProduct = (id: string) =>
  axios.delete(`${products_url}/${id}`)
export const createProduct = (product: IProduct) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  let fd = new FormData()

  if (product.imgs) {
    Array.from(product.imgs).forEach(file => fd.append('imgs', file))
  }

  ;[
    'type',
    'category',
    'article',
    'name',
    'description',
    'buy_price',
    'delivery_price',
    'height',
    'length',
    'width',
    'weight',
    'brand',
    'count',
    'address',
    'provider',
    'mark',
    'country',
  ].forEach(field => {
    // @ts-ignore
    if (product.hasOwnProperty(field) && product[field] !== undefined) {
      // @ts-ignore
      fd.append(field, product[field])
    }
  })

  fd.append('tags', JSON.stringify(product.tags))
  fd.append('videos', JSON.stringify(product.videos))
  return axios.post(`${products_url}`, fd, config)
}

export const updateProduct = (product: IProduct, id: string) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  let fd = new FormData()

  if (product.imgs) {
    Array.from(product.imgs).forEach(file => fd.append('imgs', file))
  }

  ;[
    'type',
    'category',
    'article',
    'name',
    'description',
    'buy_price',
    'delivery_price',
    'height',
    'length',
    'width',
    'weight',
    'brand',
    'count',
    'address',
    'provider',
    'mark',
    'country',
  ].forEach(field => {
    // @ts-ignore
    if (product.hasOwnProperty(field) && product[field] !== undefined) {
      // @ts-ignore
      fd.append(field, product[field])
    }
  })

  fd.append('tags', JSON.stringify(product.tags))
  fd.append('videos', JSON.stringify(product.videos))
  return axios.patch(`${products_url}/${id}`, fd, config)
}

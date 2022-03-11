import axios from 'axios'
import { ICategory } from '../app_components/categories/Categories'
import { IProduct } from '../app_components/products/ProductsForm'
import { IProductMove } from '../app_components/warehouses/ProductsIn'
import { IProductIn } from '../app_components/warehouses/ProductsInForm'
import { IProductOut } from '../app_components/warehouses/ProductsOutForm'
import { IWarehouse } from '../app_components/warehouses/WarehouseForm'

export const url = process.env.REACT_APP_SERVER_URL
export const auth_url = `${url}/api/auth`
export const user_url = `${url}/api/user`
export const super_admin_url = `${url}/api/super_admin`
export const categories_url = `${url}/api/categories`
export const products_url = `${url}/api/products`
export const warehouses_url = `${url}/api/warehouses`

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
      const originalRequest = error.config
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        await refreshToken()
        return axios(originalRequest)
      }
      // axios.interceptors.response.eject(interceptor)
      return Promise.reject(error)
    }
  )
}
createAxiosResponseInterceptor()

/** Auth */
export const getUser = () => axios.get(`${user_url}/user`)
export const getUserColumnsSetting = (setting: string) =>
  axios.get(`${user_url}/columns_settings`, { params: setting })
export const setUserColumnsSetting = (
  setting: string,
  val: { [id: string]: boolean }
) =>
  axios.post(
    `${user_url}/columns_settings`,
    { new_val: val },
    { params: setting }
  )

export const superAdminGetUsers = () => axios.get(`${super_admin_url}/users`)
export const superAdminUpdateUser = (id: string, admin: boolean) =>
  axios.patch(`${super_admin_url}/update_user`, { id, admin })

export const login = (email: string, password: string) =>
  axios.post(`${auth_url}/login`, { email, password })
export const logout = () => axios.post(`${auth_url}/logout`, {})
export const register = (email: string, password: string) =>
  axios.post(`${auth_url}/register`, { email, password })
export const refreshToken = () => axios.post(`${auth_url}/token`, {})

/** Categories */
export const getCategories = () => axios.get(`${categories_url}`)
export const removeCategory = (id: string) =>
  axios.delete(`${categories_url}/${id}`)
export const createCategory = (category: ICategory) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  let fd = new FormData()
  category.img && fd.append('file', category.img)
  category.name && fd.append('name', category.name)
  category.description && fd.append('description', category.description)
  category.tags && fd.append('tags', JSON.stringify(category.tags))
  category.parent && fd.append('parent', category.parent)
  return axios.post(`${categories_url}`, fd, config)
}
export const editCategory = (id: string, category: ICategory) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } }
  let fd = new FormData()
  category.img && fd.append('file', category.img)
  category.description && fd.append('description', category.description)
  category.name && fd.append('name', category.name)
  category.name && fd.append('id', id)
  category.tags && fd.append('tags', JSON.stringify(category.tags))
  category.parent && fd.append('parent', category.parent)
  return axios.post(`${categories_url}/edit`, fd, config)
}

/** Products */
export const getProducts = (pageNumber: number, nPerPage: number) =>
  axios.get(`${products_url}/page/${pageNumber}/${nPerPage}`)
export const getProduct = (id: string) =>
  axios.get(`${products_url}/product/${id}`)
export const removeProducts = (ids: string[]) =>
  axios.post(`${products_url}/remove`, { products: ids })
export const getProductName = async (id: string): Promise<string> => {
  const product = await getProduct(id)
  return product.data.name
}
export const getProductsCount = () => axios.get(`${products_url}/count`)

export const searchProducts = (
  str: string,
  options: string[],
  pageNumber: number = 0,
  nPerPage: number = 1000000
) =>
  axios.post(`${products_url}/search/${pageNumber}/${nPerPage}`, {
    str,
    options,
  })

export const removeProduct = (id: string) =>
  axios.delete(`${products_url}/${id}`)

const productToFormData = (product: IProduct) => {
  let fd = new FormData()

  if (product.imgs) {
    Array.from(product.imgs).forEach(file => fd.append('imgs', file))
  }
  console.log(product)
  ;[
    'type',
    'category',
    'article',
    'name',
    'description',
    'color',
    'buy_price',
    'delivery_price',
    'update_price',
    'height',
    'length',
    'width',
    'weight',
    'brand',
    'count',
    'address',
    'warehouse',
    'provider',
    'mark',
    'country',
    'barcode',
  ].forEach(field => {
    // @ts-ignore
    if (product.hasOwnProperty(field) && product[field] !== undefined) {
      // @ts-ignore
      fd.append(field, product[field])
    }
  })

  fd.append('tags', JSON.stringify(product.tags))
  fd.append('videos', JSON.stringify(product.videos))
  fd.append('marketplace_data', JSON.stringify(product.marketplace_data))
  fd.append('addresses', JSON.stringify(product.addresses))
  return fd
}
export const createProduct = (product: IProduct) =>
  axios.post(`${products_url}`, productToFormData(product), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const createExcelProducts = (products: IProduct[]) =>
  axios.post(`${products_url}/excel`, { products })
export const createWbProduct = (url: string) =>
  axios.post(`${products_url}/wb_url`, { url })
export const getExcelImports = () => axios.get(`${products_url}/excel`)

export const updateProduct = (product: IProduct, id: string) =>
  axios.patch(`${products_url}/${id}`, productToFormData(product), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateManyProducts = (data: any, ids: string[]) =>
  axios.patch(`${products_url}/many`, { data, ids })
/** Warehouses */
export const getWarehouses = () => axios.get(`${warehouses_url}`)
export const createWarehouse = (warehouse: IWarehouse) =>
  axios.post(`${warehouses_url}`, warehouse)
export const updateWarehouse = (id: string, warehouse: IWarehouse) =>
  axios.patch(`${warehouses_url}/${id}`, warehouse)
export const removeWarehouse = (id: string) =>
  axios.delete(`${warehouses_url}/${id}`)

export const wildberries_url = `${url}/api/wildberries`

export const getWildBerriesProducts = () =>
  axios.get(`${wildberries_url}/products`, {})

export const getWildberriesOrders = (
  status: string,
  date_start: string,
  take: number,
  skip: number
) =>
  axios.get(`${wildberries_url}/orders`, {
    params: { status, date_start, take, skip },
  })

export const updateWildberriesSettings = (e: any) =>
  axios.post(`${wildberries_url}/settings`, e)
export const getWildberriesSettings = () =>
  axios.get(`${wildberries_url}/settings`)

export const runUpdateWildberriesStocks = () =>
  axios.get(`${wildberries_url}/update`)
export const runRefreshOrders = () =>
  axios.get(`${wildberries_url}/update_orders`)
export const checkWildberriesConnection = () =>
  axios.get(`${wildberries_url}/check`, {})
export const wbUpdateDiscount = (nmId: string, val: number) =>
  axios.post(`${wildberries_url}/update_discount`, {
    nmId,
    val,
  })
export const wbUpdatePrice = (nmId: string, val: number) =>
  axios.post(`${wildberries_url}/update_price`, {
    nmId,
    val,
  })

export const remains_url = `${url}/api/remains`

export const getRemains = () => axios.get(`${remains_url}`)

export const products_out_url = `${url}/api/products_out`

export const getProductsOut = () => axios.get(`${products_out_url}`)
export const createProductOut = (product_out: IProductOut) =>
  axios.post(`${products_out_url}`, product_out)
export const updateProductOut = (id: string, product_out: IProductOut) =>
  axios.patch(`${products_out_url}/${id}`, product_out)
export const removeProductOut = (id: string) =>
  axios.delete(`${products_out_url}/${id}`)

export const products_move_url = `${url}/api/products_move`

export const getProductsMove = () => axios.get(`${products_move_url}`)
export const createProductMove = (product_out: IProductMove) =>
  axios.post(`${products_move_url}`, product_out)
export const updateProductMove = (id: string, product_out: IProductMove) =>
  axios.patch(`${products_move_url}/${id}`, product_out)
export const removeProductMove = (id: string) =>
  axios.delete(`${products_move_url}/${id}`)

export const products_in_url = `${url}/api/products_in`

export const getProductsIn = () => axios.get(`${products_in_url}`)
export const createProductIn = (product_in: IProductIn) =>
  axios.post(`${products_in_url}`, product_in)
export const updateProductIn = (id: string, product_in: IProductIn) =>
  axios.patch(`${products_in_url}/${id}`, product_in)
export const removeProductIn = (id: string) =>
  axios.delete(`${products_in_url}/${id}`)

export const stats_url = `${url}/api/stats`

export const getStats = (start: Date, end: Date, product: string) =>
  axios.post(`${stats_url}`, { start, end, product })

export const notifications_url = `${url}/api/notifications`

export const getNotifications = () => axios.get(`${notifications_url}`)
export const removeNotification = (id: string) =>
  axios.delete(`${notifications_url}/${id}`)

export const backup_url = `${url}/api/backup`

export const getBackup = () => axios.get(`${backup_url}`)
export const restoreBackup = (json: any) => axios.patch(`${backup_url}`)

import dotenv from 'dotenv'
dotenv.config()

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
export const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES
export const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES
export const WILDBERRIES_URL = process.env.WILDBERRIES_URL || ''
export const WILDBERRIES_API_KEY = process.env.WILDBERRIES_API_KEY || ''

export const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL || ''
export const PORT = process.env.PORT || '5000'
export const CORS_ORIGIN = process.env.CORS_ORIGIN
export const NODE_ENV = process.env.NODE_ENV || 'production'
export const MAIN_WAREHOUSE_ID =
  process.env.MAIN_WAREHOUSE_ID || '61eda2d7f1a680d8e9adea70'

import axios from 'axios'
import { trace } from 'console'
import { WILDBERRIES_URL } from '../config/env'
import ProductModel, { IProduct } from '../models/product'
import logger from '../util/logger'
import { readSettings } from './settings'

export const updateJson = async () => {
  const res = (
    await axios.post(
      `https://mirishop.ru/bnpapi/ordersList`,
      {},
      {
        headers: { token: 'n6yujum27wkc2fi49yp3ossysyhmb9kmf9q76vcf' },
      }
    )
  ).data
  console.log(JSON.stringify(res, null, 2))
}

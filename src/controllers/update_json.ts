import axios from 'axios'
import { trace } from 'console'
import FormData from 'form-data'
import moment from 'moment'
import { URLSearchParams } from 'url'
import { WILDBERRIES_URL } from '../config/env'
import MsOrdersCancelledModel from '../models/ms_orders_cancelled'
import MsOrdersDoneModel from '../models/ms_orders_done'
import MsOrdersReadyModel from '../models/ms_orders_ready'
import ProductModel, { IProduct } from '../models/product'
import ProductMoveModel from '../models/products_move'
import logger from '../util/logger'
import { changeRemains } from './remains'
import { readSettings } from './settings'

export const updateJson = async () => {
  const params = new URLSearchParams()
  params.append(
    'dates[start]',
    moment('20220301', 'YYYYMMDD').format('YYYY-MM-DD')
  )
  params.append('dates[end]', moment().format('YYYY-MM-DD'))

  const res = (
    await axios.post(`https://mirishop.ru/bnpapi/ordersList`, params, {
      headers: {
        token: 'n6yujum27wkc2fi49yp3ossysyhmb9kmf9q76vcf',
      },
    })
  ).data

  const warehouse_reserve = await readSettings('warehouse_reserve')
  const warehouse_send = await readSettings('warehouse_send')

  await Promise.all(
    Object.values(res.data.ordersList).map(async (x: any) => {
      const new_order = {
        mirishop_id: x.id,
        date: moment(x.create_datetime).toDate(),
        status: x.state_id,
        content: x.items.map((i: any) => ({
          sku_id: i.sku_id,
          quantity: Number(i.quantity),
        })),
        summ: x.items.reduce(
          (old: number, i: any) => Number(i.quantity) + old,
          0
        ),
      }

      const remain: any[] = new_order.content.map((x: any) => ({
        warehouse: null,
        product: x.sku_id,
        quantity_add: x.quantity,
      }))

      if (
        x.state_id === 'obabotan-dlya-do' ||
        x.state_id === 'obrabotan-i-goto'
      ) {
        if (
          !(await MsOrdersReadyModel.findOne({
            mirishop_id: new_order.mirishop_id,
            status: new_order.status,
          }))
        ) {
          await new MsOrdersReadyModel(new_order).save()
          await changeRemains(
            remain.map(x => ({
              warehouse: warehouse_send,
              product: x.product,
              quantity_add: -x.quantity_add,
            }))
          )
          await changeRemains(
            remain.map(x => ({
              warehouse: warehouse_reserve,
              product: x.product,
              quantity_add: x.quantity_add,
            }))
          )
        }
      } else if (x.state_id === 'otmenen') {
        if (
          !(await MsOrdersCancelledModel.findOne({
            mirishop_id: new_order.mirishop_id,
            status: new_order.status,
          }))
        ) {
          await new MsOrdersCancelledModel(new_order).save()
          await changeRemains(
            remain.map(x => ({
              warehouse: warehouse_send,
              product: x.product,
              quantity_add: x.quantity_add,
            }))
          )
          await changeRemains(
            remain.map(x => ({
              warehouse: warehouse_reserve,
              product: x.product,
              quantity_add: -x.quantity_add,
            }))
          )
        }
      } else if (x.state_id === 'zakryt') {
        if (
          !(await MsOrdersDoneModel.findOne({
            mirishop_id: new_order.mirishop_id,
            status: new_order.status,
          }))
        ) {
          await new MsOrdersDoneModel(new_order).save()
          await changeRemains(
            remain.map(x => ({
              warehouse: warehouse_reserve,
              product: x.product,
              quantity_add: -x.quantity_add,
            }))
          )
        }
      }
    })
  )
}

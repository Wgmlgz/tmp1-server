import { Button, Card, message } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'
import { IProductIn, IProductInFull, ProductsInForm } from './ProductsInForm'

import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import {
  createProductIn,
  getProductsIn,
  removeProductIn,
  updateProductIn,
} from '../../api/products_in'
import axios from 'axios'
import { IWarehouseFull } from './WarehouseForm'
import { getProducts, getWarehouses } from '../../api/api'
import { IProductFull } from '../products/ProductsForm'
import moment from 'moment'

export interface IProductMove {
  warehouse_from: string
  warehouse_to: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

export interface IProductMoveFull extends IProductMove {
  _id: string
}

export default function ProductsIn() {
  const [products_in, setProductsIn] = useState<IProductInFull[]>([])
  const [product_in_cteation, setProductInCreation] = useState<boolean>(false)

  const [warehouses_map, setWarehousesMap] = useState(new Map<string, string>())
  const [products_map, setProductsMap] = useState(new Map<string, string>())

  const [edited_product_in_id, setEditedProductInId] = useState<string>('')
  const [edited_product_in, setEditedProductIn] = useState<IProductInFull>()

  const fetchProductsIn = async () => {
    try {
      const res = await getProductsIn()
      setProductsIn(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    fetchProductsIn()
    const setup = async () => {
      try {
        const res_warehouses = await getWarehouses()
        const res_products = await getProducts()
        setWarehousesMap(
          new Map<string, string>(
            res_warehouses.data.map((warehouse: IWarehouseFull) => [
              warehouse._id,
              warehouse.name,
            ])
          )
        )
        setProductsMap(
          new Map<string, string>(
            res_products.data.map((product: IProductFull) => [
              product._id,
              product.name,
            ])
          )
        )
      } catch (err) {
        if (axios.isAxiosError(err)) {
          message.error(err.response?.data)
        }
      }
    }
    setup()
  }, [])
  const columns: ColumnsType<IProductInFull> = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (text, record, index) => moment(record.date).format('DD-MM-YYYY'),
    },
    {
      title: 'Склад',
      dataIndex: 'warehouse',
      key: 'warehouse',
      render: (text, record, index) => warehouses_map.get(record.warehouse),
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Товары',
      dataIndex: 'products',
      key: 'products',
      render: (text, record, index) => (
        <p style={{ whiteSpace: 'pre' }}>
          {record.products
            .map(
              product =>
                `${products_map.get(product.product)}  ${product.quantity}`
            )
            .join('\n')}
        </p>
      ),
    },
    {
      title: '',
      key: 'remove',
      render: (text, record, index) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            onClick={async () => {
              try {
                const res = await removeProductIn(record._id)
                message.success(res.data)
                fetchProductsIn()
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}>
            <DeleteOutlined />
          </Button>
          <Button
            onClick={() => {
              setEditedProductInId(record._id)
              setEditedProductIn(record)
            }}>
            <EditOutlined />
          </Button>
        </div>
      ),
    },
  ]
  return (
    <>
      {product_in_cteation && (
        <div
          className='full-screen-card-style'
          onClick={() => {
            setProductInCreation(false)
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsInForm
              onCancel={() => setProductInCreation(false)}
              onSubmit={async (data: IProductIn) => {
                try {
                  const res = await createProductIn(data)
                  await fetchProductsIn()
                  message.success(res.data)
                  setProductInCreation(false)
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}
              header='Новое оприходование'
              button='Создать новое оприходование'
            />
          </div>
        </div>
      )}
      {edited_product_in_id && (
        <div
          className='full-screen-card-style'
          onClick={() => {
            setEditedProductInId('')
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsInForm
              product_in={edited_product_in}
              onCancel={() => setEditedProductInId('')}
              onSubmit={async (data: IProductIn) => {
                try {
                  const res = await updateProductIn(edited_product_in_id, data)
                  await fetchProductsIn()
                  message.success(res.data)
                  setEditedProductInId('')
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}
              header='Обновить оприходование'
              button='Обновить оприходование'
            />
          </div>
        </div>
      )}
      <Card
        title='Оприходования'
        extra={
          <Button
            type='primary'
            onClick={() => {
              setProductInCreation(true)
            }}>
            <PlusCircleOutlined /> оприходование
          </Button>
        }>
        <Table dataSource={products_in} columns={columns} />
      </Card>
    </>
  )
}

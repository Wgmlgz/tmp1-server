import { Button, Card, message } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'
import { IProductOut, IProductOutFull, ProductsOutForm } from './ProductsOutForm'

import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import {
  createProductOut,
  getProductsOut,
  removeProductOut,
  updateProductOut,
} from '../../api/products_out'
import axios from 'axios'
import { IWarehouseFull } from './WarehouseForm'
import { getProducts, getWarehouses } from '../../api/api'
import { IProductFull } from '../products/ProductsForm'
import moment from 'moment'


export default function ProductsOut() {
  const [products_out, setProductsOut] = useState<IProductOutFull[]>([])
  const [product_out_cteation, setProductOutCreation] = useState<boolean>(false)

  const [warehouses_map, setWarehousesMap] = useState(new Map<string, string>())
  const [products_map, setProductsMap] = useState(new Map<string, string>())

  const [edited_product_out_id, setEditedProductOutId] = useState<string>('')
  const [edited_product_out, setEditedProductOut] = useState<IProductOutFull>()

  const fetchProductsOut = async () => {
    try {
      const res = await getProductsOut()
      setProductsOut(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    fetchProductsOut()
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
  const columns: ColumnsType<IProductOutFull> = [
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
                const res = await removeProductOut(record._id)
                message.success(res.data)
                fetchProductsOut()
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
              setEditedProductOutId(record._id)
              setEditedProductOut(record)
            }}>
            <EditOutlined />
          </Button>
        </div>
      ),
    },
  ]
  return (
    <>
      {product_out_cteation && (
        <div
          className='full-screen-card-style'
          onClick={() => {
            setProductOutCreation(false)
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsOutForm
              onCancel={() => setProductOutCreation(false)}
              onSubmit={async (data: IProductOut) => {
                try {
                  const res = await createProductOut(data)
                  await fetchProductsOut()
                  message.success(res.data)
                  setProductOutCreation(false)
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}
              header='Новое списание'
              button='Создать новое списание'
            />
          </div>
        </div>
      )}
      {edited_product_out_id && (
        <div
          className='full-screen-card-style'
          onClick={() => {
            setEditedProductOutId('')
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsOutForm
              product_out={edited_product_out}
              onCancel={() => setEditedProductOutId('')}
              onSubmit={async (data: IProductOut) => {
                try {
                  const res = await updateProductOut(edited_product_out_id, data)
                  await fetchProductsOut()
                  message.success(res.data)
                  setEditedProductOutId('')
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}
              header='Обновить списание'
              button='Обновить списание'
            />
          </div>
        </div>
      )}
      <div style={{ width: 'fit-content' }}>
        <Card
          title='Списания'
          extra={
            <Button
              type='primary'
              onClick={() => {
                setProductOutCreation(true)
              }}>
              <PlusCircleOutlined /> списание
            </Button>
          }>
          <Table dataSource={products_out} columns={columns} />
        </Card>
      </div>
    </>
  )
}

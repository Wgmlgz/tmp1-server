import { Button, Card, message, Popconfirm, Popover } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'
import {
  IProductOut,
  IProductOutFull,
  ProductsOutForm,
} from './ProductsOutForm'

import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from '@ant-design/icons'
import {
  createProductOut,
  getProductsOut,
  updateProductOut,
} from '../../api/api'
import axios from 'axios'
import { IWarehouseFull } from './WarehouseForm'
import { getWarehouses } from '../../api/api'
import moment from 'moment'
import FullscreenCard from '../FullscreenCard'

export default function ProductsOut() {
  const [products_out, setProductsOut] = useState<IProductOutFull[]>([])
  const [product_out_cteation, setProductOutCreation] = useState<boolean>(false)

  const [warehouses_map, setWarehousesMap] = useState(new Map<string, string>())

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
        setWarehousesMap(
          new Map<string, string>(
            res_warehouses.data.map((warehouse: IWarehouseFull) => [
              warehouse._id,
              warehouse.name,
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
            .map(product => `${product.name}  ${product.quantity}`)
            .join('\n')}
        </p>
      ),
    },
    {
      title: 'Подробнее',
      key: 'remove',
      render: (text, record, index) => (
        <Popover
          placement='left'
          content={
            <ProductsOutForm
              onCancel={() => setProductOutCreation(false)}
              header='Списание'
              button='Создать новое списание'
              product_out={record}
            />
          }>
          <Button>Подробнее</Button>,
        </Popover>
      ),
    },
    // {
    //   title: '',
    //   key: 'remove',
    //   render: (text, record, index) => (
    //     <div style={{ display: 'flex', gap: '10px' }}>
    //       <Popconfirm
    //         title='Вы точно хотите удалить списание?'
    //         onConfirm={async () => {
    //           try {
    //             const res = await removeProductOut(record._id)
    //             message.success(res.data)
    //             fetchProductsOut()
    //           } catch (err) {
    //             if (axios.isAxiosError(err)) {
    //               message.error(err.response?.data)
    //             }
    //           }
    //         }}
    //         okText='Да'
    //         cancelText='Нет'>
    //         <Button>
    //           <DeleteOutlined />
    //         </Button>
    //       </Popconfirm>
    //       <Button
    //         onClick={() => {
    //           setEditedProductOutId(record._id)
    //           setEditedProductOut(record)
    //         }}>
    //         <EditOutlined />
    //       </Button>
    //     </div>
    //   ),
    // },
  ]
  return (
    <>
      {product_out_cteation && (
        <FullscreenCard onCancel={() => setProductOutCreation(false)}>
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
        </FullscreenCard>
      )}
      {edited_product_out_id && (
        <FullscreenCard onCancel={() => setEditedProductOutId('')}>
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
        </FullscreenCard>
      )}
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
    </>
  )
}

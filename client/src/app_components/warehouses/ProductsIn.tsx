import { Button, Card, message, Popover } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import { IProductIn, IProductInFull, ProductsInForm } from './ProductsInForm'

import { PlusCircleOutlined } from '@ant-design/icons'
import { createProductIn, getProductsIn, updateProductIn } from '../../api/api'
import axios from 'axios'
import { IWarehouseFull } from './WarehouseForm'
import { getWarehouses } from '../../api/api'
import moment from 'moment'
import FullscreenCard from '../FullscreenCard'

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
            .filter((product, id) => id <= 3)
            .map((product, id) => {
              if (id === 3) return '...'
              return `${product.name}  ${product.quantity}`
            })
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
            <ProductsInForm
              onCancel={() => setProductInCreation(false)}
              header='Оприходование'
              button='Создать новое списание'
              product_in={record}
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
    //         title='Вы точно хотите удалить оприходование?'
    //         onConfirm={async () => {
    //           try {
    //             const res = await removeProductIn(record._id)
    //             message.success("Оприходование удалено")
    //             fetchProductsIn()
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
    //           setEditedProductInId(record._id)
    //           setEditedProductIn(record)
    //         }}>
    //         <EditOutlined />
    //       </Button>
    //     </div>
    //   ),
    // },
  ]
  return (
    <>
      {product_in_cteation && (
        <FullscreenCard onCancel={() => setProductInCreation(false)}>
          <ProductsInForm
            onCancel={() => setProductInCreation(false)}
            onSubmit={async (data: IProductIn) => {
              try {
                const res = await createProductIn(data)
                await fetchProductsIn()
                message.success('Оприходование создано')
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
        </FullscreenCard>
      )}
      {edited_product_in_id && (
        <FullscreenCard onCancel={() => setEditedProductInId('')}>
          <ProductsInForm
            product_in={edited_product_in}
            onCancel={() => setEditedProductInId('')}
            onSubmit={async (data: IProductIn) => {
              try {
                const res = await updateProductIn(edited_product_in_id, data)
                await fetchProductsIn()
                message.success('Обновлено')
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
        </FullscreenCard>
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
        <Table
          dataSource={products_in?.map((x, i) => ({ ...x, key: i }))}
          columns={columns}
        />
      </Card>
    </>
  )
}

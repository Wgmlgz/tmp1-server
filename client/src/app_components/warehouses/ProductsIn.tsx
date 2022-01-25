import { Button, Card, message } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import React, { useState } from 'react'
import { IProductIn, IProductInFull, ProductsInForm } from './ProductsInForm'

import { PlusCircleOutlined } from '@ant-design/icons'

export interface IProductOut {
  warehouse: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

export interface IProductOutFull extends IProductOut {
  _id: string
}

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

  const columns: ColumnsType<IProductInFull> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descriptrion',
      dataIndex: 'descriptrion',
      key: 'descriptrion',
    },
    {
      title: 'Delete',
      key: 'remove',
      render: (text, record, index) => (
        <Button
          onClick={async () => {
            try {
              // const res = await removeWarehouse(record._id)
              // message.success(res.data)
              // fetchWarehouses()
            } catch (err) {
              // if (axios.isAxiosError(err)) {
              //   message.error(err.response?.data)
              // }
            }
          }}>
          Detele
        </Button>
      ),
    },
    {
      title: 'Edit',
      key: 'remove',
      render: (text, record, index) => (
        <Button
          onClick={() => {
            // setEditedWarehouseId(record._id)
            // setEditedWarehouse(record)
          }}>
          Edit
        </Button>
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
              onSubmit={function (product: IProductIn) {
                throw new Error('Function not implemented.')
              }}
              header='Новое оприходование'
              button='Создать новое оприходование'
            />
          </div>
        </div>
      )}
      <div style={{ width: 'fit-content' }}>
        <Card
          title='Оприходования'
          extra={
            <Button
              onClick={() => {
                setProductInCreation(true)
              }}>
              <PlusCircleOutlined /> оприходование
            </Button>
          }>
          <Table dataSource={products_in} columns={columns} />
        </Card>
      </div>
      {/* </div> */}
      {/* {edited_warehouse_id && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: '100',
            display: 'grid',
            placeItems: 'center',
            backdropFilter: 'blur(4px)',
            backgroundColor: '#22222222',
          }}
          onClick={() => {
            setEditedWarehouseId('')
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsInForm
              header='Edit product'
              button='Edit'
              onCancel={() => setEditedWarehouseId('')}
              warehouse={edited_warehouse}
              onSubmit={async warehouse => {
                try {
                  console.log(warehouse)

                  await updateWarehouse(edited_warehouse_id, warehouse)
                  await fetchWarehouses()
                  message.success('Product updated')
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    String(err.response?.data)
                      .split(',')
                      .forEach(msg => message.error(msg))
                  }
                }
              }}
            />
          </div>
        </div>
      )} */}
    </>
  )
}

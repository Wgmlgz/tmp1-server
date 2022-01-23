import { Button, Card, Form, Input, message, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import React, { FC, useEffect, useRef, useState } from 'react'
import {
  createWarehouse,
  getWarehouses,
  removeWarehouse,
  updateWarehouse,
} from '../../api/api'
import WarehouseForm, { IWarehouseFull } from './WarehouseForm'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<IWarehouseFull[]>([])

  const [edited_warehouse_id, setEditedWarehouseId] = useState<string>('')
  const [edited_warehouse, setEditedWarehouse] = useState<IWarehouseFull>()

  const columns: ColumnsType<IWarehouseFull> = [
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
              const res = await removeWarehouse(record._id)
              message.success(res.data)
              fetchWarehouses()
            } catch (err) {
              if (axios.isAxiosError(err)) {
                message.error(err.response?.data)
              }
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
            setEditedWarehouseId(record._id)
            setEditedWarehouse(record)
          }}>
          Edit
        </Button>
      ),
    },
  ]

  const fetchWarehouses = async () => {
    try {
      const res = await getWarehouses()
      setWarehouses(res.data)
      console.log(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    fetchWarehouses()
  }, [])

  return (
    <>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ width: '300px' }}>
          <WarehouseForm
            onSubmit={async warehouse => {
              try {
                const res = await createWarehouse(warehouse)
                message.success('saved')
                fetchWarehouses()
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}
            header='Create new warehouse'
            button='Create new warehouse'
          />
        </div>
        <div style={{ width: 'fit-content' }}>
          <Card title='All categories'>
            <Table dataSource={warehouses} columns={columns} />
          </Card>
        </div>
      </div>
      {edited_warehouse_id && (
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
            <WarehouseForm
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
      )}
    </>
  )
}

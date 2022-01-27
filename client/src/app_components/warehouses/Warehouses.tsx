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
import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import WarehouseForm, { IWarehouseFull } from './WarehouseForm'

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<IWarehouseFull[]>([])

  const [edited_warehouse_id, setEditedWarehouseId] = useState<string>('')
  const [edited_warehouse, setEditedWarehouse] = useState<IWarehouseFull>()

  const columns: ColumnsType<IWarehouseFull> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Описание',
      dataIndex: 'descriptrion',
      key: 'descriptrion',
    },
    {
      title: '',
      key: 'edit',
      render: (text, record, index) => (
        <div style={{ display: 'flex', gap: '10px' }}>
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
            <DeleteOutlined />
          </Button>
          <Button
            onClick={() => {
              setEditedWarehouseId(record._id)
              setEditedWarehouse(record)
            }}>
            <EditOutlined />
          </Button>
        </div>
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
            header='Создать новый склад'
            button='Создать новый склад'
          />
        </div>
        <div style={{ flexGrow: '1' }}>
          <Card title='Все склады'>
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
              header='Изменить склад'
              button='Изменить'
              onCancel={() => setEditedWarehouseId('')}
              warehouse={edited_warehouse}
              onSubmit={async warehouse => {
                try {
                  await updateWarehouse(edited_warehouse_id, warehouse)
                  await fetchWarehouses()
                  message.success('Склад обновлен')
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

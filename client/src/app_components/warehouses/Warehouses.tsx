import { Button, Card, message, Popconfirm, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  createWarehouse,
  getWarehouses,
  removeWarehouse,
  updateWarehouse,
} from '../../api/api'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import WarehouseForm, { IWarehouseFull } from './WarehouseForm'
import FullscreenCard from '../FullscreenCard'

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
          <Popconfirm
            title='Вы точно хотите удалить склад?'
            onConfirm={async () => {
              try {
                const res = await removeWarehouse(record._id)
                message.success(res.data)
                fetchWarehouses()
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}
            okText='Да'
            cancelText='Нет'>
            <Button disabled={record.undeletable}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
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
                message.success('Сохранено')
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
        <FullscreenCard onCancel={() => setEditedWarehouseId('')}>
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
        </FullscreenCard>
      )}
    </>
  )
}

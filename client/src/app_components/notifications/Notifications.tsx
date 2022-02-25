import { Button, Card, message, Table } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  getNotifications,
  products_url,
  removeNotification,
} from '../../api/api'
import useColumns from '../../hooks/useColumns'
import { IProductFull } from '../products/ProductsForm'
import { IWarehouseFull } from '../warehouses/WarehouseForm'
import { WarningOutlined, DeleteOutlined } from '@ant-design/icons'
import moment from 'moment'

interface INotification {
  product: IProductFull
  warehouse: IWarehouseFull
  date: string
  id: string
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  const columns = useColumns<INotification>('notifications', [
    {
      title: 'Изображение',
      dataIndex: 'img',
      key: 'img',
      render: (text, record, index) =>
        record.product.imgs_small &&
        record.product.imgs_small[0] && (
          <img
            style={{ borderRadius: '20px', width: '100px' }}
            src={`${products_url}/img/${record.product.imgs_small[0]}`}
            alt='img'
          />
        ),
    },
    {
      title: 'Артикул',
      dataIndex: ['product', 'article'],

      key: 'article',
    },
    {
      title: 'Штрихкод',
      dataIndex: ['product', 'barcode'],
      key: 'barcode',
    },
    {
      title: 'Имя',
      dataIndex: ['product', 'name'],
      key: 'name',
      sorter: (a, b) => a.product.name.localeCompare(b.product.name),
    },
    {
      title: 'Время',
      dataIndex: 'date',
      key: 'name',
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      render: (a, b, c) => <p>{moment(b.date).format('MM-D HH:mm')}</p>,
    },
    {
      title: 'Склад',
      dataIndex: ['warehouse', 'name'],
      key: 'warehouse',
    },
    {
      title: 'Удалить',
      dataIndex: 'remove',
      key: 'remove',
      render: (a, b, c) => (
        <Button
          onClick={async () => {
            try {
              await removeNotification(b.id)
              await fetchNotifications()
              message.success('Удалено')
            } catch (err) {
              if (axios.isAxiosError(err)) {
                message.error(err.response?.data)
              }
            }
          }}>
          <DeleteOutlined />
        </Button>
      ),
    },
  ])

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <Card
        title={
          <p style={{ color: 'orange', fontSize: '30px' }}>
            <WarningOutlined /> Недостаточно товаров
          </p>
        }>
        <Table
          dataSource={notifications.map((t, id) => ({ ...t, key: id }))}
          columns={columns}
        />
      </Card>
      <pre>{JSON.stringify(notifications, null, 2)}</pre>
    </div>
  )
}

export default Notifications

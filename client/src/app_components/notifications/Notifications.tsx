import { Card, message, Table } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { getNotifications, products_url } from '../../api/api'
import useColumns from '../../hooks/useColumns'
import { IProduct, IProductFull } from '../products/ProductsForm'
import { IWarehouseFull } from '../warehouses/WarehouseForm'

interface INotification {
  product: IProductFull
  warehouse: IWarehouseFull
  date: string
}
const Notifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await getNotifications()
      setNotifications(res.data)
      setLoading(false)
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
      key: 'type',
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
  ])

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <Card>
        <Table
          dataSource={notifications.map((t, id) => ({ ...t, key: id }))}
          columns={columns}
          loading={loading}
        />
      </Card>
      <pre>{JSON.stringify(notifications, null, 2)}</pre>
    </div>
  )
}

export default Notifications

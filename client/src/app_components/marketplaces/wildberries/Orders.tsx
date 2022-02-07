import { Button, Card, Input, message, Popconfirm, Select, Table } from 'antd'
import { Key, useEffect, useState } from 'react'

import axios from 'axios'
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table'
import { getWildberriesOrders } from '../../../api/wildberries'
import moment from 'moment'

interface IOrder {
  product: string
  warehouse: string
  quantity: number
  dateCreated: string
}

const Orders = () => {
  const [orders, setOrders] = useState<{ orders: IOrder[]; total: number }>({
    orders: [],
    total: 0,
  })
  const [status, setStatus] = useState(2);
  const [startDate, setStartDate] = useState(new Date())

  const [pagination, setPagination] = useState<TablePaginationConfig>({})
  const [loading, setLoading] = useState(false)

  const fetchProducts = async () => {
    try {
      const res = await getWildberriesOrders(
        status,
        '2021-09-30T17:14:52+03:00',
        pagination.pageSize ?? 10,
        (pagination.pageSize ?? 10) * (pagination.current ?? 0),
      )
      setPagination({ ...pagination, total: res.data.total })
      setOrders(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
      console.log(err)
    }
  }
  useEffect(() => {
    fetchProducts()
  }, [])

  const columns: ColumnsType<IOrder> = [
    {
      title: 'Создано',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (text, record, index) =>
        moment(record.dateCreated).format('DD MM YYYY HH:MM'),
    },
    {
      title: 'Штрихкод',
      dataIndex: 'barcode',
      key: 'barcode',
    },
    {
      title: 'Стоимость',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
    },

    {
      title: 'Закупочная цена',
      dataIndex: 'buy_price',
      key: 'buy_price',
    },
    {
      title: 'Цена доставки',
      dataIndex: 'delivery_price',
      key: 'delivery_price',
    },
    {
      title: 'Создан',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Количество',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Изменить/Удалить',
      dataIndex: 'name',
      key: 'name',
    },
  ]

  // const fetchProductsPagination = async (pagination: TablePaginationConfig) => {
  //   try {
  //     setLoading(true)
  //     const res = await getWildberriesOrders(
  //       pagination.current ?? 0,
  //       pagination.pageSize ?? 10
  //     )
  //     const res_count = await getProductsCount()
  //     setPagination({
  //       pageSize: pagination.pageSize || 1,
  //       current: pagination.current || 1,
  //       total: res_count.data,
  //     })
  //     console.log(pagination)

  //     setProducts(res.data)
  //     setLoading(false)
  //   } catch (err) {}
  // }
  return (
    <div style={{ width: '100%' }}>
      <Card>
        <Table
          dataSource={orders.orders}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onChange={fetchProducts}
        />
        <pre>{JSON.stringify(orders, null, 2)}</pre>
      </Card>
    </div>
  )
}

export default Orders

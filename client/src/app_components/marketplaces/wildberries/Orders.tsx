import {
  Button,
  Card,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
  Tabs,
} from 'antd'
import { Key, useEffect, useMemo, useState } from 'react'

import axios from 'axios'
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table'
import { getWildberriesOrders } from '../../../api/wildberries'
import moment from 'moment'
import { products_url } from '../../../api/api'
const { TabPane } = Tabs
interface IOrder {
  product: string
  warehouse: string
  quantity: number
  dateCreated: string
  img: string
  name: string
  totalPrice: number
  barcodes: string[]
  barcode: string
}

const Orders = () => {
  const [orders, setOrders] = useState<{ orders: IOrder[]; total: number }>({
    orders: [],
    total: 0,
  })
  const [status, setStatus] = useState('new')
  const [startDate, setStartDate] = useState(new Date())

  const defaultPagination = useMemo(
    () => ({
      pageSize: 10,
      current: 1,
    }),
    []
  )
  const [pagination, setPagination] =
    useState<TablePaginationConfig>(defaultPagination)
  const [loading, setLoading] = useState(false)

  const fetchProducts = async (pagination: TablePaginationConfig) => {
    console.log(pagination)
    setOrders({ orders: [], total: 0 })
    setLoading(true)
    try {
      console.log(status)

      const res = await getWildberriesOrders(
        status,
        '2021-09-30T17:14:52+03:00',
        pagination.pageSize ?? 10,
        (pagination.pageSize ?? 10) * ((pagination.current ?? 1) - 1)
      )
      setPagination({ ...pagination, total: res.data.total })
      setOrders(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
      console.log(err)
    }
    setLoading(false)
    console.log(pagination)
  }

  useEffect(() => {
    fetchProducts(pagination)
  }, [])
  const columns: ColumnsType<IOrder> = [
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'userStatus',
      dataIndex: 'userStatus',
      key: 'userStatus',
    },
    {
      title: '№ Заказа',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Создано',
      dataIndex: 'dateCreated',
      key: 'dateCreated',
      render: (text, record, index) =>
        moment(record.dateCreated).format('DD MM YYYY HH:MM'),
    },
    {
      title: 'Штрихкод на wb',
      dataIndex: 'barcode',
      key: 'barcode',
    },
    {
      title: 'Стоимость',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (text, record, index) => record.totalPrice / 100,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) =>
        record.img && (
          <img
            style={{ borderRadius: '20px', width: '100px' }}
            src={`${products_url}/img/${record.img}`}
            alt='img'
          />
        ),
    },
    {
      title: 'Бренд',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Артикул',
      dataIndex: 'article',
      key: 'article',
    },
    {
      title: 'Количество товаров',
      dataIndex: 'barcodes',
      key: 'barcodes',
      render: (text, record, index) => record.barcodes.length,
    },
    {
      title: 'Куда доставить',
      dataIndex: 'officeAddress',
      key: 'officeAddress',
    },
    {
      title: 'Склад',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: 'ID СЦ wb',
      dataIndex: 'wbWhId',
      key: 'wbWhId',
    },
    {
      title: 'Время на сборку заказа',
      dataIndex: 'wbWhId',
      key: 'wbWhId',
      render: (text, record, index) => {
        // if (status === 2) return ''
        moment.locale('ru')
        let secs = Math.floor(
          moment(record.dateCreated).add(2, 'days').diff(moment()) / 1000
        )
        const neg = secs < 0
        if (neg)
          secs = Math.floor(
            moment().diff(moment(record.dateCreated).add(2, 'days')) / 1000
          )
        const days = Math.floor(secs / (24 * 60 * 60))
        const hours = Math.floor(secs / (60 * 60)) % 24
        const mins = Math.floor(secs / 60) % 60
        secs = secs % 60
        return `${neg ? '- ' : ''}${
          days ? days + 'д ' : ''
        }${hours}:${mins}:${secs}`
      },
    },
  ]

  useEffect(() => {
    fetchProducts(pagination)
  }, [status])
  return (
    <div style={{ width: '100%' }}>
      <Card>
        <Tabs
          defaultActiveKey='0'
          onChange={async e => {
            console.log(e)

            setPagination(defaultPagination)
            setStatus(e)
          }}>
          <TabPane tab='Новые заказы' key='new'>
            <Table
              dataSource={orders.orders}
              columns={columns}
              loading={loading}
            />
          </TabPane>
          <TabPane tab='На сборке' key='on_assembly'>
            <Table
              dataSource={orders.orders}
              columns={columns}
              loading={loading}
              pagination={pagination}
            />
          </TabPane>
          <TabPane tab='Активные заказы' key='active'>
            <Table
              dataSource={orders.orders}
              columns={columns}
              loading={loading}
            />
          </TabPane>
          <TabPane tab='Заказы в пути' key='on_delivery'>
            <Table
              dataSource={orders.orders}
              columns={columns}
              loading={loading}
            />
          </TabPane>
          <TabPane tab='Все' key='all'>
            <Table
              dataSource={orders.orders}
              columns={columns}
              loading={loading}
              pagination={{ ...pagination, pageSizeOptions: [100] }}
              onChange={pagination => {
                fetchProducts(pagination)
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
      <pre>{JSON.stringify(orders, null, 2)}</pre>
    </div>
  )
}

export default Orders

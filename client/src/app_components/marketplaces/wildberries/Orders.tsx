import { Button, Card, Input, message, Popconfirm, Select, Table } from 'antd'
import { Key, useEffect, useMemo, useState } from 'react'

import axios from 'axios'
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table'
import { getWildberriesOrders } from '../../../api/wildberries'
import moment from 'moment'
import { products_url } from '../../../api/api'

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
  const [status, setStatus] = useState(2)
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

  useEffect(() => {
    setPagination(defaultPagination)
  }, [defaultPagination, status])

  const fetchProducts = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    try {
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
  }
  
  useEffect(() => {
    fetchProducts(pagination)
  }, [])

  const columns: ColumnsType<IOrder> = [
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
        if (status === 2) return ''
        moment.locale('ru')
        let secs = moment(record.dateCreated).add(2, 'days').diff(moment())
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
          days ? days + ' дней ' : ''
        }${hours}:${mins}:${secs}`
      },
    },
  ]

  return (
    <div style={{ width: '100%' }}>
      <Card>
        <div style={{ display: 'flex' }}>
          <Button
            onClick={() => {
              setStatus(0)
              fetchProducts(pagination)
            }}>
            Новые заказы
          </Button>
          <Button
            onClick={() => {
              setStatus(1)
              fetchProducts(pagination)
            }}>
            На сборке
          </Button>
          <Button
            onClick={() => {
              setStatus(2)
              fetchProducts(pagination)
            }}>
            Собранные
          </Button>
        </div>
        <br />
        <Table
          dataSource={orders.orders}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onChange={pagination => {
            fetchProducts(pagination)
          }}
        />
      </Card>
    </div>
  )
}

export default Orders

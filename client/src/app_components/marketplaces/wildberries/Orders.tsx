import { Button, Card, Form, message, Modal, Select, Table, Tabs } from 'antd'
import { Key, useEffect, useMemo, useState } from 'react'
import ExcelJS from 'exceljs'
import axios from 'axios'
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table'
import {
  closeSupply,
  createSupply,
  getWildberriesOrders,
  printSupply,
  putOrders,
  wbPrintStickers,
} from '../../../api/api'
import moment from 'moment'
import { products_url } from '../../../api/api'
import useColumns from '../../../hooks/useColumns'
import Item from 'antd/lib/list/Item'
import Barcodes from '../../products/Barcodes'
import { saveFile } from '../../products/Excel'
import FullscreenCard from '../../FullscreenCard'
const { TabPane } = Tabs
interface IOrder {
  product: string
  warehouse: string
  quantity: number
  dateCreated: string
  img: string
  name: string
  orderId: number
  totalPrice: number
  article: string
  barcodes: string[]
  barcode: string
  supply?: string
}
const { Option } = Select

const exportExcel = (orders: (IOrder | undefined)[]) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('My Sheet')

  worksheet.columns = [
    { header: 'supply', key: 'supply' },
    { header: 'address', key: 'address' },
    { header: 'name', key: 'name' },
    { header: 'barcode', key: 'barcode' },
    { header: 'article', key: 'article' },
    { header: 'dateCreated', key: 'dateCreated' },
    { header: 'warehouse', key: 'warehouse' },
    { header: 'count', key: 'count' },
    { header: 'orderId', key: 'orderId' },
  ]
  orders
    .filter(x => !!x)
    .map((order: any) => ({
      supply: order.supply,
      address: order.address,
      name: order.name,
      barcode: order.barcode,
      article: order.article,
      dateCreated: order.dateCreated,
      warehouse: order.warehouse,
      count: order.barcodes.length,
      orderId: order.orderId,
    }))
    .forEach(order => {
      worksheet.addRow(order)
    })
  saveFile('exported_orders.xls', workbook)
}
const Orders = () => {
  const [orders, setOrders] = useState<{
    orders: IOrder[]
    total: number
    supplies: any[]
  }>({
    orders: [],
    total: 0,
    supplies: [],
  })
  const [status, setStatus] = useState('new')

  const defaultPagination = useMemo(
    () => ({
      pageSize: 10,
      current: 1,
    }),
    []
  )
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] =
    useState<TablePaginationConfig>(defaultPagination)

  const fetchProducts = async (pagination: TablePaginationConfig) => {
    setLoading(true)
    setOrders({ orders: [], total: 0, supplies: [] })
    try {
      const res = await getWildberriesOrders(
        status,
        '2021-09-30T17:14:52+03:00',
        1000,
        0
        // pagination.pageSize ?? 10,
        // (pagination.pageSize ?? 10) * ((pagination.current ?? 1) - 1)
      )
      setPagination({ ...pagination, total: res.data.total })
      setOrders(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts(pagination)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const columns: ColumnsType<IOrder> = useColumns('wb_orders', [
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Номер поставки',
      dataIndex: 'supply',
      key: 'supply',
      sorter: (a, b) => Number(a.supply) - Number(b.supply),
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
      sorter: (a, b) =>
        moment(a.dateCreated).unix() - moment(b.dateCreated).unix(),
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
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
    },
    {
      title: 'Адресс',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Фото',
      dataIndex: 'img',
      key: 'img',
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
  ])

  useEffect(() => {
    fetchProducts(pagination)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const [selected_row_keys, setSelectedRowKeys] = useState<Key[]>([])
  const [barcodes_creation, setBarcodesCreation] = useState('')

  const urltoFile = async (url: any, filename: any, mimeType: any) => {
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    return new File([buf], filename, { type: mimeType })
  }
  const printStickers = async () => {
    try {
      const res = await wbPrintStickers(
        selected_row_keys
          .map(i => orders?.orders.at(i as number))
          .filter(x => !!x)
          .map((product: any) => product.orderId)
      )
      const file = await urltoFile(
        `data:text/plain;base64,${res.data.data.file}`,
        res.data.data.name,
        res.data.data.mimeType
      )
      var data = new Blob([file], { type: res.data.data.mimeType })
      var csvURL = window.URL.createObjectURL(data)
      const tempLink = document.createElement('a')
      tempLink.href = csvURL
      tempLink.setAttribute('download', res.data.data.name)
      tempLink.click()

      message.success('Поставка закрыта')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }
  return (
    <div style={{ width: '100%' }}>
      {barcodes_creation && (
        <FullscreenCard
          onCancel={() => {
            setBarcodesCreation('')
          }}>
          <Barcodes
            barcodes={selected_row_keys
              .map(i => orders?.orders.at(i as number))
              .filter(x => !!x)
              .map((product: any) => ({
                barcode: product.barcode || '',
                name: product.name || '',
                article: product.article || '',
              }))}
          />
        </FullscreenCard>
      )}
      <Card>
        <Tabs
          defaultActiveKey='0'
          onChange={async e => {
            setPagination(defaultPagination)
            setStatus(e)
          }}>
          <TabPane tab='Новые заказы' key='new'>
            <Form
              onFinish={async e => {
                try {
                  await putOrders(
                    e.supply,
                    selected_row_keys.map(
                      i => orders?.orders?.at(i as number)?.orderId
                    ) as any[]
                  )
                  message.success('Поставка закрыта')
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Form.Item
                  name='supply'
                  required={true}
                  rules={[
                    {
                      required: true,
                    },
                  ]}>
                  <Select placeholder='Добавить заказы в поставку'>
                    {orders.supplies &&
                      orders.supplies.map(({ supplyId }) => (
                        <Option value={supplyId}>{supplyId}</Option>
                      ))}
                  </Select>
                </Form.Item>
                <Button type='primary' htmlType='submit'>
                  Добавить заказы в поставку
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await createSupply()
                      message.success('Поставка создана')
                    } catch (err) {
                      if (axios.isAxiosError(err)) {
                        message.error(err.response?.data)
                      }
                    }
                  }}>
                  Создать поставку
                </Button>
              </div>
            </Form>
            <Table
              rowSelection={{
                selectedRowKeys: selected_row_keys,
                onChange: selectedRowKeys => {
                  setSelectedRowKeys(selectedRowKeys)
                },
              }}
              dataSource={orders.orders?.map((x, i) => ({ ...x, key: i }))}
              columns={columns}
              pagination={{ ...pagination, pageSizeOptions: [100] }}
              onChange={pagination => {
                fetchProducts(pagination)
              }}
            />
          </TabPane>
          <TabPane tab='На сборке' key='on_assembly'>
            <Table
              dataSource={orders.orders?.map((x, i) => ({ ...x, key: i }))}
              columns={columns}
              pagination={{ ...pagination, pageSizeOptions: [100] }}
              onChange={pagination => {
                fetchProducts(pagination)
              }}
            />
          </TabPane>
          <TabPane tab='Активные заказы' key='active'>
            <Form
              onFinish={async e => {
                try {
                  await closeSupply(e.supply)
                  message.success('Поставка закрыта')
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Form.Item
                  name='supply'
                  required={true}
                  rules={[
                    {
                      required: true,
                    },
                  ]}>
                  <Select placeholder='Выберите поставку для закрытия'>
                    {orders.supplies &&
                      orders.supplies.map(({ supplyId }) => (
                        <Option value={supplyId}>{supplyId}</Option>
                      ))}
                  </Select>
                </Form.Item>
                <Button type='primary' htmlType='submit'>
                  Закрыть поставку
                </Button>
              </div>
            </Form>
            <Form
              onFinish={async e => {
                try {
                  const res = await printSupply(e.supply)

                  const file = await urltoFile(
                    `data:text/plain;base64,${res.data.file}`,
                    res.data.name,
                    res.data.mimeType
                  )
                  var data = new Blob([file], { type: res.data.mimeType })
                  var csvURL = window.URL.createObjectURL(data)
                  const tempLink = document.createElement('a')
                  tempLink.href = csvURL
                  tempLink.setAttribute('download', res.data.name)
                  tempLink.click()

                  message.success('Поставка закрыта')
                } catch (err) {
                  if (axios.isAxiosError(err)) {
                    message.error(err.response?.data)
                  }
                }
              }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Form.Item
                  name='supply'
                  required={true}
                  rules={[
                    {
                      required: true,
                    },
                  ]}>
                  <Select placeholder='Распечатать штрихкод поставки'>
                    {orders.supplies &&
                      orders.supplies.map(({ supplyId }) => (
                        <Option value={supplyId}>{supplyId}</Option>
                      ))}
                  </Select>
                </Form.Item>
                <Button type='primary' htmlType='submit'>
                  Распечатать штрихкод поставки
                </Button>
              </div>
            </Form>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                onClick={() => {
                  exportExcel(
                    selected_row_keys.map(i => orders?.orders?.at(i as number))
                  )
                }}>
                Экспорт в Excel выделенных заказов
              </Button>
              <Button
                onClick={() => {
                  setBarcodesCreation('selected')
                }}>
                Распечатать штрихкод на WB
              </Button>
              <Button
                onClick={() => {
                  printStickers()
                }}>
                Распечатать стикеры заказов
              </Button>
            </div>
            <Table
              loading={loading}
              dataSource={orders.orders?.map((x, i) => ({ ...x, key: i }))}
              rowSelection={{
                selectedRowKeys: selected_row_keys,
                onChange: selectedRowKeys => {
                  setSelectedRowKeys(selectedRowKeys)
                },
              }}
              columns={columns}
              // pagination={{ ...pagination, pageSizeOptions: [100] }}
              // onChange={pagination => {
              //   // fetchProducts(pagination)
              // }}
            />
          </TabPane>
          <TabPane tab='Заказы в пути' key='on_delivery'>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                onClick={() => {
                  exportExcel(
                    selected_row_keys.map(i => orders?.orders?.at(i as number))
                  )
                }}>
                Экспорт в Excel выделенных заказов
              </Button>
              <Button
                onClick={() => {
                  setBarcodesCreation('selected')
                }}>
                Распечатать штрихкод на WB
              </Button>
              <Button
                onClick={() => {
                  printStickers()
                }}>
                Распечатать стикеры заказов
              </Button>
              <Form
                onFinish={async e => {
                  try {
                    const res = await printSupply(e.supply)

                    const file = await urltoFile(
                      `data:text/plain;base64,${res.data.file}`,
                      res.data.name,
                      res.data.mimeType
                    )
                    var data = new Blob([file], { type: res.data.mimeType })
                    var csvURL = window.URL.createObjectURL(data)
                    const tempLink = document.createElement('a')
                    tempLink.href = csvURL
                    tempLink.setAttribute('download', res.data.name)
                    tempLink.click()

                    message.success('Поставка закрыта')
                  } catch (err) {
                    if (axios.isAxiosError(err)) {
                      message.error(err.response?.data)
                    }
                  }
                }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Form.Item
                    name='supply'
                    required={true}
                    rules={[
                      {
                        required: true,
                      },
                    ]}>
                    <Select placeholder='Распечатать штрихкод поставки'>
                      {orders.supplies &&
                        orders.supplies.map(({ supplyId }) => (
                          <Option value={supplyId}>{supplyId}</Option>
                        ))}
                    </Select>
                  </Form.Item>
                  <Button type='primary' htmlType='submit'>
                    Распечатать штрихкод поставки
                  </Button>
                </div>
              </Form>
            </div>
            <Table
              loading={loading}
              rowSelection={{
                selectedRowKeys: selected_row_keys,
                onChange: selectedRowKeys => {
                  setSelectedRowKeys(selectedRowKeys)
                },
              }}
              dataSource={orders.orders?.map((x, i) => ({ ...x, key: i }))}
              columns={columns}
              // pagination={{ ...pagination, pageSizeOptions: [100] }}
              // onChange={pagination => {
              //   // fetchProducts(pagination)
              // }}
            />
          </TabPane>
          <TabPane tab='Все' key='all'>
            <Table
              dataSource={orders.orders?.map((x, i) => ({ ...x, key: i }))}
              columns={columns}
              pagination={{ ...pagination, pageSizeOptions: [100] }}
              onChange={pagination => {
                fetchProducts(pagination)
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
      {/* <pre>{JSON.stringify(orders, null, 2)}</pre> */}
    </div>
  )
}

export default Orders

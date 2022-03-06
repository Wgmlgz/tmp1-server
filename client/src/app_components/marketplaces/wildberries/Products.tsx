import {
  AutoComplete,
  Button,
  Card,
  Input,
  message,
  Popover,
  Select,
  Table,
  Image
} from 'antd'
import axios, { AxiosResponse } from 'axios'
import React, { Key, useEffect, useState } from 'react'
import { products_url, wbUpdateDiscount, wbUpdatePrice } from '../../../api/api'
import { getWildBerriesProducts } from '../../../api/api'
import useColumns from '../../../hooks/useColumns'
import { highlightText } from '../../products/Products'
import { EditOutlined } from '@ant-design/icons'
import Barcodes from '../../products/Barcodes'
import FullscreenCard from '../../FullscreenCard'
interface IWilbberriesProduct {
  barcode: string
  article: string
  color: string
  sell_price: string
  price: number
  discount: number
  name: string
  img: string
  delivery_price: string
  buy_price: string
  nmId: string
}

// interface IWilbberriesProducts {
//   stocks: IWilbberriesProduct[]
//   total: number
// }
const { Option } = Select

export default function WildberriesProducts() {
  const [selected_products, setSelectedProducts] = useState<
    IWilbberriesProduct[]
  >([])
  const [selected_row_keys, setSelectedRowKeys] = useState<Key[]>([])
  const [barcodes_creation, setBarcodesCreation] = useState('')

  const [products, setProducts] = useState<IWilbberriesProduct[]>([])
  const [searched_products, setSearchedProducts] = useState<
    IWilbberriesProduct[]
  >([])
  const [searched_product, setSearchedProduct] = useState('')
  const setup = async () => {
    try {
      const res: AxiosResponse<IWilbberriesProduct[], any> =
        await getWildBerriesProducts()
      setProducts(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    setup()
  }, [])

  useEffect(() => {
    const set = new Set(selected_row_keys)
    setSelectedProducts(
      searched_products.filter(product => set.has(product.nmId))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selected_row_keys])

  const columns = useColumns<IWilbberriesProduct>(
    'wb_products',
    [
      {
        title: 'Название',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
        render: text => highlightText(text, searched_product),
      },
      {
        title: 'Артикул',
        dataIndex: 'article',
        key: 'article',
        render: text => highlightText(text, searched_product),
      },
      {
        title: 'Изображение',
        dataIndex: 'img',
        key: 'img',
        render: (text, record, index) =>
          record.img && (
            <Image
              src={`${products_url}/img/${record.img}`}
            />
          ),
      },
      {
        title: 'Цена доставки',
        dataIndex: 'delivery_price',
        key: 'delivery_price',
        sorter: (a, b) =>
          Number(a.delivery_price || 0) - Number(b.delivery_price || 0),
      },
      {
        title: 'Закупочная цена',
        dataIndex: 'buy_price',
        key: 'buy_price',
        sorter: (a, b) => Number(a.buy_price || 0) - Number(b.buy_price || 0),
      },
      {
        title: 'Штрихкод на wb',
        dataIndex: 'barcode',
        key: 'barcode',
      },
      {
        title: 'Номенклатура на wb',
        dataIndex: 'nmId',
        key: 'nmId',
        render: text => highlightText(String(text), searched_product),
        sorter: (a, b) => Number(a.nmId) - Number(b.nmId),
      },
      {
        title: 'Цена на wb',
        dataIndex: 'price',
        key: 'price',
        sorter: (a, b) => Number(a.price) - Number(b.price),
        render: (text, record, index) => (
          <span>
            <Popover
              placement='left'
              content={
                <form
                  onSubmit={async (e: any) => {
                    e.preventDefault()
                    const val: number = Number(e.target.val.value)
                    console.log(val)
                    try {
                      const res = await wbUpdatePrice(record.nmId, val)
                      console.log(res.data)
                      message.success('Цена обновлена')
                      setup()
                    } catch (err) {
                      if (axios.isAxiosError(err)) {
                        message.error(err.response?.data)
                      }
                    }
                  }}>
                  <Input.Group compact>
                    <Input
                      type='number'
                      defaultValue={record.price}
                      min={0}
                      name='val'
                      style={{ width: 'calc(100% - 100px)' }}
                    />
                    <Button htmlType='submit' type='primary'>
                      Сохранить
                    </Button>
                  </Input.Group>
                </form>
              }>
              {record.price}
              <Button>
                <EditOutlined />
              </Button>
            </Popover>
          </span>
        ),
      },
      {
        title: 'Размер скидки',
        dataIndex: 'discount',
        key: 'discount',
        sorter: (a, b) => Number(a.discount) - Number(b.discount),
        render: (text, record, index) => (
          <span>
            <Popover
              placement='left'
              content={
                <form
                  onSubmit={async (e: any) => {
                    e.preventDefault()
                    const val: number = Number(e.target.val.value)
                    console.log(val)
                    try {
                      const res = await wbUpdateDiscount(record.nmId, val)
                      console.log(res.data)
                      message.success('Скидка обновлена')
                      setup()
                    } catch (err) {
                      if (axios.isAxiosError(err)) {
                        message.error(err.response?.data)
                      }
                    }
                  }}>
                  <Input.Group compact>
                    <Input
                      type='number'
                      defaultValue={record.discount}
                      min={0}
                      max={100}
                      name='val'
                      style={{ width: 'calc(100% - 100px)' }}
                      addonAfter='%'
                    />
                    <Button htmlType='submit' type='primary'>
                      Сохранить
                    </Button>
                  </Input.Group>
                </form>
              }>
              {record.discount}%{' '}
              <Button>
                <EditOutlined />
              </Button>
            </Popover>
          </span>
        ),
      },
      {
        title: 'Цена со скидкой на wb',
        dataIndex: 'price_discount',
        key: 'price_discount',
        sorter: (a, b) =>
          Math.round(a.price * ((100 - a.discount) / 100)) -
          Math.round(b.price * ((100 - b.discount) / 100)),
        render: (text, record, index) =>
          Math.round(record.price * ((100 - record.discount) / 100)),
      },
    ],
    [searched_product]
  )

  useEffect(() => {
    setSearchedProducts(products)
  }, [products])

  useEffect(() => {
    if (!searched_product) {
      setSearchedProducts(products)
    }
    const r = new RegExp(searched_product, 'i')
    setSearchedProducts(
      products?.filter(
        product =>
          r.test(product.name) ||
          r.test(product.article) ||
          r.test(String(product.nmId))
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searched_product])

  return (
    <>
      {barcodes_creation && (
        <FullscreenCard
          onCancel={() => {
            setBarcodesCreation('')
          }}>
          <Barcodes
            barcodes={
              barcodes_creation === 'barcodes wb'
                ? selected_products.map(product => ({
                  article: product.article,
                  barcode: product.barcode,
                  name: product.name,
                  color: product.color
                }))
                : selected_products.map(product => ({
                  article: product.article,
                  barcode: product.barcode,
                  name: product.name,
                }))
            }
          />
        </FullscreenCard>
      )}
      <Card>
        <div style={{ display: 'flex', gap: '20px' }}>
          <AutoComplete
            style={{
              width: 600,
            }}
            onSearch={e => {
              setSearchedProduct(e)
              console.log(e)
            }}
            placeholder='поиск'
          />
          <Button
            type='primary'
            onClick={() => {
              setBarcodesCreation('barcodes')
            }}>
            Напечатать штрихкоды
          </Button>
          <Select
            style={{ width: 300 }}
            value={'Напечатать штрихкоды'}
            onSelect={async (e: any) => {
              if (e === 'barcodes all') {
                // await fetchAllProducts()
              }
              setBarcodesCreation(e)
            }}>
            <Option value='barcodes'>Напечатать штрихкоды</Option>
            <Option value='barcodes wb'>
              Напечатать штрихкоды Wildberries FB
            </Option>
          </Select>
        </div>
        <br />
        <Table
          rowSelection={{
            selectedRowKeys: selected_row_keys,
            onChange: selectedRowKeys => {
              setSelectedRowKeys(selectedRowKeys)
            },
          }}
          dataSource={searched_products?.map((x, i) => ({
            ...x,
            key: x.nmId,
          }))}
          columns={columns}
        />
        {/* <pre> {JSON.stringify(products, null, 2)}</pre> */}
      </Card>
    </>
  )
}

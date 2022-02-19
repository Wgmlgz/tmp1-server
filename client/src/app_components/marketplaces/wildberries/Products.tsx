import { AutoComplete, Card, message, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'
import { products_url } from '../../../api/api'
import { getWildBerriesProducts } from '../../../api/api'
import useColumns from '../../../hooks/useColumns'
import { highlightText } from '../../products/Products'

interface IWilbberriesProduct {
  barcode: string
  article: string
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

export default function WildberriesProducts() {
  const [products, setProducts] = useState<IWilbberriesProduct[]>()
  const [searched_products, setSearchedProducts] =
    useState<IWilbberriesProduct[]>()
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
            <img
              style={{ borderRadius: '20px', width: '100px' }}
              src={`${products_url}/img/${record.img}`}
              alt='img'
            />
          ),
      },
      {
        title: 'Цена доставки',
        dataIndex: 'delivery_price',
        key: 'delivery_price',
        sorter: (a, b) => Number(a.delivery_price) - Number(b.delivery_price),
      },
      {
        title: 'Закупочная цена',
        dataIndex: 'buy_price',
        key: 'buy_price',
        sorter: (a, b) => Number(a.buy_price) - Number(b.buy_price),
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
      },
      {
        title: 'Размер скидки',
        dataIndex: 'discount',
        key: 'discount',
        sorter: (a, b) => Number(a.discount) - Number(b.discount),
        render: (text, record, index) => <p>{record.discount}%</p>,
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
  }, [searched_product])

  return (
    <Card>
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
      <br />
      <br />
      <Table dataSource={searched_products as any} columns={columns} />
      {/* <pre> {JSON.stringify(products, null, 2)}</pre> */}
    </Card>
  )
}

import { Card, message, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios, { AxiosResponse } from 'axios'
import React, { useEffect, useState } from 'react'
import { products_url } from '../../../api/api'
import { getWildBerriesProducts } from '../../../api/wildberries'

interface IWilbberriesProduct {
  barcode: string
  article: string
  sell_price: string
  price: number
  discount: number
  name: string
  img: string
}

// interface IWilbberriesProducts {
//   stocks: IWilbberriesProduct[]
//   total: number
// }

export default function WildberriesProducts() {
  const [products, setProducts] = useState<IWilbberriesProduct[]>()
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

  const columns: ColumnsType<IWilbberriesProduct> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => String(a.name).localeCompare(String(b.name)),
    },
    {
      title: 'Артикул',
      dataIndex: 'article',
      key: 'article',
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
    },
    {
      title: 'Закупочная цена',
      dataIndex: 'buy_price',
      key: 'buy_price',
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
    },
    {
      title: 'Цена на wb',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Цена со скидкой на wb',
      dataIndex: 'discount',
      key: 'discount',
      render: (text, record, index) =>
        Math.round(record.price * ((100 - record.discount) / 100)),
    },
  ]

  return (
    <Card>
      <Table dataSource={products as any} columns={columns} />
      {/* <pre> {JSON.stringify(products, null, 2)}</pre> */}
    </Card>
  )
}

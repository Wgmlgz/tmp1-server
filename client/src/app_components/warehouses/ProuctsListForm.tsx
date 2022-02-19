import {
  AutoComplete,
  Button,
  ConfigProvider,
  InputNumber,
  message,
  Table,
  Typography,
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'
import { getProductName, searchProducts } from '../../api/api'
import { highlightText } from '../products/Products'
import { IProductFull } from '../products/ProductsForm'

export interface ProductInfo {
  product: string
  quantity: number
  name: string
}

interface Props {
  default_products?: ProductInfo[]
  onChange: (products: ProductInfo[]) => any
  locked?: boolean
}

const ProductsListForm: FC<Props> = ({
  default_products,
  onChange,
  locked,
}) => {
  const [search_products, setSearchProducts] = useState<IProductFull[]>([])
  const [edited_product, setEditedProduct] = useState(-1)

  const [new_product_name, setNewProductName] = useState('')

  const [search_query, setSearchQuery] = useState<string>('')
  const [products, setProducts] = useState<ProductInfo[]>([])

  useEffect(() => {
    onChange(products)
  }, [onChange, products])

  useEffect(() => {
    const setup = async () => {
      try {
        default_products && setProducts(default_products)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          message.error(err.response?.data)
        }
      }
    }
    setup()
  }, [default_products])

  const onSearch = async (query: string) => {
    try {
      const res_products = await searchProducts(query)
      setSearchProducts(res_products.data)
      setSearchQuery(query)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }
  useEffect(() => {
    onSearch('')
  }, [edited_product])

  const columns: ColumnsType<ProductInfo> = [
    {
      title: 'Продукт',
      dataIndex: 'product',
      key: 'product',
      render: (text, record, index) =>
        locked ? (
          record.name
        ) : index === edited_product ? (
          <AutoComplete
            style={{
              width: 600,
            }}
            defaultValue={record.name}
            options={
              search_products.map(product => ({
                label: (
                  <div>
                    {highlightText(
                      `${product.name} ${product.article} ${product.barcode}`,
                      search_query
                    )}
                  </div>
                ),
                value: product._id,
              })) as any
            }
            onSelect={async (
              data: string,
              { label, value }: { label: string; value: string }
            ) => {
              const new_products = products
              new_products[index].product = value
              new_products[index].name = await getProductName(value)
              setProducts(new_products)
              setEditedProduct(-1)
            }}
            onSearch={onSearch}
            placeholder='поиск'
          />
        ) : (
          <Typography.Link onClick={() => setEditedProduct(index)}>
            {record.name}
          </Typography.Link>
        ),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record, index) =>
        locked ? (
          record.quantity
        ) : (
          <InputNumber
            min={0}
            value={record.quantity}
            onChange={e => {
              const new_products = [...products]
              new_products[index].quantity = Number(e)
              setProducts(new_products)
              setEditedProduct(-1)
            }}
          />
        ),
    },
  ]
  if (!locked) {
    columns.push({
      title: 'Удалить',
      dataIndex: 'remove',
      key: 'remove',
      render: (text, record, index) => (
        <Button
          onClick={() => {
            const new_products = [...products]
            new_products.splice(index, 1)
            setProducts(new_products)
            setEditedProduct(-1)
          }}>
          Удалить
        </Button>
      ),
    })
  }

  return (
    <ConfigProvider renderEmpty={() => ''}>
      <Table
        columns={columns}
        dataSource={products}
        footer={
          locked
            ? undefined
            : () => (
                <AutoComplete
                  style={{
                    width: 600,
                  }}
                  value={new_product_name}
                  options={
                    search_products.map((product, id) => ({
                      label: (
                        <div key={id}>
                          {highlightText(
                            `${product.name} ${product.article} ${product.barcode}`,
                            search_query
                          )}
                        </div>
                      ),
                      value: product._id,
                    })) as any
                  }
                  onSelect={async (
                    data: string,
                    { label, value }: { label: string; value: string }
                  ) => {
                    let add = true
                    products.forEach(product => {
                      if (product.product === value) add = false
                    })
                    if (add)
                      setProducts([
                        ...products,
                        {
                          product: value,
                          name: await getProductName(value),
                          quantity: 0,
                        },
                      ])
                    else message.info('Продукт уже довавлен')
                    setNewProductName('')
                  }}
                  onSearch={e => {
                    onSearch(e)
                    setNewProductName(e)
                  }}
                  placeholder='поиск'
                />
              )
        }
      />
    </ConfigProvider>
  )
}
export default ProductsListForm

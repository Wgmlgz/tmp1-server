import {
  AutoComplete,
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Table,
  Typography,
} from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import moment, { locale } from 'moment'
import { FC, useCallback, useEffect, useState } from 'react'
import { getProducts, getWarehouses, searchProducts } from '../../api/api'
import { createProductMove, getProductsMove } from '../../api/products_move'
import { highlightText } from '../products/Products'
import { IProductFull } from '../products/ProductsForm'
import { IWarehouseFull } from './WarehouseForm'

const { Option } = Select

export interface IProductMove {
  warehouse_to: string
  warehouse_from: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

export interface IProductMoveFull extends IProductMove {
  _id: string
}

interface Props {
  onSubmit: (product: IProductMove) => any
  onCancel: () => any
  header: string
  button: string
  product_move?: IProductMoveFull
}

interface ProductMovefo {
  product: string
  quantity: number
  name: string
}

export const ProductsMoveForm: FC<Props> = ({
  onSubmit,
  onCancel,
  header,
  button,
  product_move,
}) => {
  const [warehouses, setWarehouses] = useState<IWarehouseFull[]>([])
  const [search_products, setSearchProducts] = useState<IProductFull[]>([])
  const [products, setProducts] = useState<ProductMovefo[]>([])
  const [products_map, setProductsMap] = useState(new Map<string, string>())

  const [edited_product, setEditedProduct] = useState(-1)

  const [new_product_name, setNewProductName] = useState('')

  const [search_query, setSearchQuery] = useState<string>('')

  const onFinish = async (data: IProductMove) => {
    data.products = products
    onSubmit(data)
  }

  useEffect(() => {
    const setup = async () => {
      try {
        const res_warehouses = await getWarehouses()
        setWarehouses(res_warehouses.data)
        const res_products = await getProducts()

        const new_products_map = new Map<string, string>(
          res_products.data.map((product: IProductFull) => [
            product._id,
            product.name,
          ])
        )

        product_move &&
          setProducts(
            product_move.products.map(product => ({
              ...product,
              name: new_products_map.get(product.product) || product.product,
            }))
          )
        setProductsMap(new_products_map)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          message.error(err.response?.data)
        }
      }
    }
    setup()
  }, [product_move])

  const columns: ColumnsType<ProductMovefo> = [
    {
      title: 'Продукт',
      dataIndex: 'product',
      key: 'product',
      render: (text, record, index) =>
        index === edited_product ? (
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
            onSelect={(
              data: string,
              { label, value }: { label: string; value: string }
            ) => {
              const new_products = products
              new_products[index].product = value
              new_products[index].name = products_map.get(value) || ''
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
      render: (text, record, index) => (
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
    {
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
    },
  ]
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

  return (
    <Card title={header}>
      <Form
        name='normal_login'
        className='login-form'
        onFinish={onFinish}
        initialValues={{
          warehouse_to: product_move?.warehouse_to,
          warehouse_from: product_move?.warehouse_from,
          date: moment(product_move?.date) || moment(),
          comment: product_move?.comment,
        }}>
        <Form.Item>
          <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Item
                label='Склад отправления'
                name='warehouse_from'
                rules={[
                  { required: true, message: 'Пожалуйста выберете склад!' },
                ]}>
                <Select
                  defaultValue={product_move?._id}
                  style={{ width: '200px' }}>
                  {warehouses.map(warehouse => (
                    <Option value={warehouse._id}>{warehouse.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label='Склад доставки'
                name='warehouse_to'
                rules={[
                  { required: true, message: 'Пожалуйста выберете склад!' },
                ]}>
                <Select
                  defaultValue={product_move?._id}
                  style={{ width: '200px' }}>
                  {warehouses.map(warehouse => (
                    <Option value={warehouse._id}>{warehouse.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='Дата' name='date'>
                <DatePicker format='DD MM YYYY' />
              </Form.Item>
            </div>
            <Form.Item label='Комметарий' name='comment'>
              <Input.TextArea />
            </Form.Item>
            <ConfigProvider renderEmpty={() => ''}>
              <Table
                columns={columns}
                dataSource={products}
                footer={() => (
                  <AutoComplete
                    style={{
                      width: 600,
                    }}
                    value={new_product_name}
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
                    onSelect={(
                      data: string,
                      { label, value }: { label: string; value: string }
                    ) => {
                      setProducts([
                        ...products,
                        {
                          product: value,
                          name: products_map.get(value) || '',
                          quantity: 0,
                        },
                      ])
                      setNewProductName('')
                    }}
                    onSearch={e => {
                      onSearch(e)
                      setNewProductName(e)
                    }}
                    placeholder='поиск'
                  />
                )}
              />
            </ConfigProvider>
          </div>
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
            {button}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

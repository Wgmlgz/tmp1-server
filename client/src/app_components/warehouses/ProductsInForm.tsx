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
import { createProductIn, getProductsIn } from '../../api/products_in'
import { IProductFull } from '../products/ProductsForm'
import { IWarehouseFull } from './WarehouseForm'

const { Option } = Select

export interface IProductIn {
  warehouse: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
  }[]
}

export interface IProductInFull extends IProductIn {
  _id: string
}

interface Props {
  onSubmit: (product: IProductIn) => any
  onCancel: () => any
  header: string
  button: string
  product_in?: IProductInFull
}

interface ProductInfo {
  product: string
  quantity: number
  name: string
}

export const ProductsInForm: FC<Props> = ({
  onSubmit,
  onCancel,
  header,
  button,
  product_in,
}) => {
  const [warehouses, setWarehouses] = useState<IWarehouseFull[]>([])
  const [search_products, setSearchProducts] = useState<IProductFull[]>([])
  const [products, setProducts] = useState<ProductInfo[]>([])
  const [products_map, setProductsMap] = useState(new Map<string, string>())

  const [edited_product, setEditedProduct] = useState(-1)

  const [new_product_name, setNewProductName] = useState('')

  const onFinish = async (data: IProductIn) => {
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

        product_in &&
          setProducts(
            product_in.products.map(product => ({
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
  }, [product_in])

  const columns: ColumnsType<ProductInfo> = [
    {
      title: 'Продукт',
      dataIndex: 'product',
      key: 'product',
      render: (text, record, index) =>
        index === edited_product ? (
          <AutoComplete
            defaultValue={record.name}
            options={search_products.map(product => ({
              label: product.name,
              value: product._id,
            }))}
            style={{
              width: 200,
            }}
            onSelect={(
              data: string,
              { label, value }: { label: string; value: string }
            ) => {
              const new_products = products
              new_products[index].product = value
              new_products[index].name = label
              setProducts(new_products)
              setEditedProduct(-1)
            }}
            onSearch={onSearch}
            placeholder='input here'
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
          warehouse: product_in?.warehouse,
          date: moment(product_in?.date) || moment(),
          comment: product_in?.comment,
        }}>
        <Form.Item>
          <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Form.Item
                label='Склад'
                name='warehouse'
                rules={[
                  { required: true, message: 'Пожалуйста выберете склад!' },
                ]}>
                <Select
                  defaultValue={product_in?._id}
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
                    value={new_product_name}
                    options={search_products.map(product => ({
                      label: product.name,
                      value: product._id,
                    }))}
                    style={{
                      width: 200,
                    }}
                    onSelect={(
                      data: string,
                      { label, value }: { label: string; value: string }
                    ) => {
                      setProducts([
                        ...products,
                        { product: value, name: label, quantity: 0 },
                      ])
                      setNewProductName('')
                    }}
                    onSearch={e => {
                      onSearch(e)
                      setNewProductName(e)
                    }}
                    placeholder='input here'
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
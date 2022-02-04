import { Button, Card, DatePicker, Form, Input } from 'antd'
import moment from 'moment'
import { FC, useState } from 'react'
import ProductsListForm, { ProductInfo } from './ProuctsListForm'
import WarehouseSelect from './WarehouseSelect'

export interface IProductOut {
  warehouse: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
    name: string
  }[]
}

export interface IProductOutFull extends IProductOut {
  _id: string
}

interface Props {
  onSubmit?: (product: IProductOut) => any
  onCancel: () => any
  header: string
  button: string
  product_out?: IProductOutFull
}

interface ProductOutfo {
  product: string
  quantity: number
  name: string
}

export const ProductsOutForm: FC<Props> = ({
  onSubmit,
  onCancel,
  header,
  button,
  product_out,
}) => {
  const [products, setProducts] = useState<ProductOutfo[]>([])

  const onFinish = async (data: IProductOut) => {
    data.products = products
    onSubmit && onSubmit(data)
  }

  return (
    <Card title={header}>
      <Form
        name='normal_login'
        className='login-form'
        onFinish={onFinish}
        initialValues={{
          warehouse: product_out?.warehouse,
          date: moment(product_out?.date) || moment(),
          comment: product_out?.comment,
        }}>
        <Form.Item>
          <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <WarehouseSelect
                required={true}
                locked={!onSubmit}
                label='Склад'
                name='warehouse'
                default_value={product_out?.warehouse}
              />
              <Form.Item label='Дата' name='date'>
                {onSubmit ? (
                  <DatePicker format='DD MM YYYY' />
                ) : (
                  <p style={{ paddingTop: '5px' }}>
                    {moment(product_out?.date).format('DD MM YYYY')}
                  </p>
                )}
              </Form.Item>
            </div>
            <Form.Item label='Комметарий' name='comment'>
              {onSubmit ? (
                <Input.TextArea />
              ) : (
                <p style={{ paddingTop: '5px' }}>{product_out?.comment}</p>
              )}
            </Form.Item>
            <ProductsListForm
              locked={!onSubmit}
              default_products={product_out?.products}
              onChange={(products: ProductInfo[]) => {
                setProducts(products)
              }}
            />
          </div>
        </Form.Item>
        {onSubmit && (
          <Form.Item>
            <Button type='primary' htmlType='submit' style={{ width: '100%' }}>
              {button}
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  )
}

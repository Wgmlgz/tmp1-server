import { Button, Card, DatePicker, Form, Input } from 'antd'
import moment from 'moment'
import { FC, useState } from 'react'
import ProductsListForm, { ProductInfo } from './ProuctsListForm'
import WarehouseSelect from './WarehouseSelect'

export interface IProductIn {
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

export interface IProductInFull extends IProductIn {
  _id: string
}

interface Props {
  onSubmit?: (product: IProductIn) => any
  onCancel: () => any
  header: string
  button: string
  product_in?: IProductInFull
}

export const ProductsInForm: FC<Props> = ({
  onSubmit,
  onCancel,
  header,
  button,
  product_in,
}) => {
  const onFinish = async (data: IProductIn) => {
    data.products = products
    onSubmit && onSubmit(data)
  }
  const [products, setProducts] = useState<ProductInfo[]>([])

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
              <WarehouseSelect
                required={true}
                locked={!onSubmit}
                label='Склад'
                name='warehouse'
                default_value={product_in?.warehouse}
              />
              <Form.Item label='Дата' name='date'>
                {onSubmit ? (
                  <DatePicker format='DD MM YYYY' />
                ) : (
                  <p style={{ paddingTop: '5px' }}>
                    {moment(product_in?.date).format('DD MM YYYY')}
                  </p>
                )}
              </Form.Item>
            </div>
            <Form.Item label='Комметарий' name='comment'>
              {onSubmit ? (
                <Input.TextArea />
              ) : (
                <p style={{ paddingTop: '5px' }}>{product_in?.comment}</p>
              )}
            </Form.Item>
            <ProductsListForm
              locked={!onSubmit}
              default_products={product_in?.products}
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

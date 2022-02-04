import { Button, Card, DatePicker, Form, Input } from 'antd'
import moment from 'moment'
import { FC, useState } from 'react'
import ProductsListForm, { ProductInfo } from './ProuctsListForm'
import WarehouseSelect from './WarehouseSelect'

export interface IProductMove {
  warehouse_to: string
  warehouse_from: string
  date: Date
  user: string
  comment?: string
  products: {
    product: string
    quantity: number
    name: string
  }[]
}

export interface IProductMoveFull extends IProductMove {
  _id: string
}

interface Props {
  onSubmit?: (product: IProductMove) => any
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
  const [products, setProducts] = useState<ProductMovefo[]>([])

  const onFinish = async (data: IProductMove) => {
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
          warehouse_to: product_move?.warehouse_to,
          warehouse_from: product_move?.warehouse_from,
          date: moment(product_move?.date) || moment(),
          comment: product_move?.comment,
        }}>
        <Form.Item>
          <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <WarehouseSelect
                locked={!onSubmit}
                label='Склад отправления'
                name='warehouse_from'
                default_value={product_move?.warehouse_from}
              />
              <WarehouseSelect
                locked={!onSubmit}
                label='Склад доставки'
                name='warehouse_to'
                default_value={product_move?.warehouse_to}
              />
              <Form.Item label='Дата' name='date'>
                {onSubmit ? (
                  <DatePicker format='DD MM YYYY' />
                ) : (
                  <p style={{ paddingTop: '5px' }}>
                    {moment(product_move?.date).format('DD MM YYYY')}
                  </p>
                )}
              </Form.Item>
            </div>
            <Form.Item label='Комметарий' name='comment'>
              {onSubmit ? (
                <Input.TextArea />
              ) : (
                <p style={{ paddingTop: '5px' }}>{product_move?.comment}</p>
              )}
            </Form.Item>
            <ProductsListForm
              locked={!onSubmit}
              default_products={product_move?.products}
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

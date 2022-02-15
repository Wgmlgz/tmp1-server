import { Button, Card, Form, Input } from 'antd'
import { FC } from 'react'

export interface IWarehouse {
  name: string
  description?: string
  undeletable?: boolean
}
export interface IWarehouseFull extends IWarehouse {
  _id: string
}

interface Props {
  onSubmit: (product: IWarehouse) => any
  onCancel?: () => any
  header: string
  button: string
  warehouse?: IWarehouseFull
}

const WarehouseForm: FC<Props> = ({
  onSubmit,
  onCancel,
  header,
  button,
  warehouse,
}) => (
  <Card title={header}>
    <Form
      name='normal_login'
      className='login-form'
      onFinish={onSubmit}
      initialValues={warehouse}>
      <Form.Item
        name='name'
        rules={[
          {
            required: true,
            message: 'Пожалуйста, введите название склада!',
          },
        ]}>
        <Input placeholder='Имя' />
      </Form.Item>
      <Form.Item name='description'>
        <Input.TextArea placeholder='Описание' />
      </Form.Item>
      <Form.Item>
        <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
          {button}
        </Button>
      </Form.Item>
      {onCancel && (
        <Form.Item>
          <Button style={{ width: '100%' }} onClick={onCancel}>
            Отмена
          </Button>
        </Form.Item>
      )}
    </Form>
  </Card>
)

export default WarehouseForm

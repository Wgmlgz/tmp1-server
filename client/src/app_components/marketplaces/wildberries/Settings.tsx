import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Space,
} from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  checkWildberriesConnection,
  getWildberriesSettings,
  runRefreshOrders,
  runUpdateWildberriesStocks,
  updateWildberriesSettings,
} from '../../../api/api'
import WarehouseSelect from '../../warehouses/WarehouseSelect'

import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

export default function Settings() {
  const [msg, setMsg] = useState('')
  const [settings, setSettings] = useState<any>()

  const setup = async () => {
    try {
      const res = await getWildberriesSettings()
      setSettings(res.data)
    } catch (e) {
      console.log(e)
      if (axios.isAxiosError(e)) {
        message.error(e.response?.data)
      }
    }
  }

  useEffect(() => {
    setup()
  }, [])

  return (
    <Card title='Настройки wb'>
      {settings && (
        <Form
          name='normal_login'
          className='login-form'
          initialValues={settings}
          onFinish={async e => {
            try {
              console.log(e)
              await updateWildberriesSettings(e)
              message.success('Обновлено')
            } catch (e) {
              if (axios.isAxiosError(e)) {
                message.error(e.response?.data)
              }
            }
          }}>
          <WarehouseSelect
            label={'Склад отправки'}
            name={'sender_warehouse'}
            required={false}
          />

          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item name='update_stocks_enabled' valuePropName='checked'>
              <Checkbox
                name='update_stocks_enabled'
                defaultChecked={settings.update_stocks_enabled}
              />
            </Form.Item>
            <Form.Item label='Интервал отправки (секунды)' name='update_stocks'>
              <InputNumber placeholder='Интервал отправки (секунды)' />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item name='update_orders_enabled' valuePropName='checked'>
              <Checkbox
                name='update_orders_enabled'
                defaultChecked={settings.update_orders_enabled}
              />
            </Form.Item>
            <Form.Item
              label='Интервал обновления заказов (секунды)'
              name='update_orders'>
              <InputNumber placeholder='Интервал обновления заказов (секунды)' />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item name='update_prices_enabled' valuePropName='checked'>
              <Checkbox
                name='update_prices_enabled'
                defaultChecked={settings.update_prices_enabled}
              />
            </Form.Item>
            <Form.Item
              label='Интервал обновления цен (секунды)'
              name='update_prices'>
              <InputNumber placeholder='Интервал обновления цен (секунды)' />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <Form.Item name='update_json_enabled' valuePropName='checked'>
              <Checkbox
                name='update_json_enabled'
                defaultChecked={settings.update_json_enabled}
              />
            </Form.Item>
            <Form.Item
              label='Интервал обмена JSON (секунды)'
              name='update_json'>
              <InputNumber placeholder='Интервал обмена JSON (секунды)' />
            </Form.Item>
          </div>

          <Form.Item label='Количество часов для выгрузки' name='update_time_h'>
            <InputNumber placeholder='Количество часов для выгрузки' />
          </Form.Item>

          <Form.Item label='API ключ' name='api_key'>
            <TextArea placeholder='API ключ' />
          </Form.Item>

          <div style={{ width: '500px' }}>
            <Form.List name='prices'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <Space key={field.key} align='baseline'>
                      <Form.Item
                        {...field}
                        label='Цена'
                        name={[field.name, 'price']}
                        rules={[{ required: true, message: 'Введите цену' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        label='Модификатор'
                        name={[field.name, 'modifier']}
                        rules={[
                          { required: true, message: 'Введите модификатор' },
                        ]}>
                        <Input />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}

                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() => {
                        if (fields.length < 20) {
                          add()
                        } else {
                          message.error('Максимум 20 ячеек')
                        }
                      }}
                      block
                      icon={<PlusOutlined />}>
                      Добавить модификатор
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
            <Form.Item style={{ flexGrow: 1 }}>
              <Button type='primary' htmlType='submit'>
                Обновить настройки
              </Button>
            </Form.Item>
            <Form.Item style={{ flexGrow: 1 }}>
              <Button
                type='dashed'
                onClick={async () => {
                  try {
                    await checkWildberriesConnection()
                    message.success('OK')
                  } catch (e) {
                    console.log(e)
                    message.error('Ошибка соединения')

                    if (axios.isAxiosError(e)) {
                      message.error(e.response?.data)
                    }
                  }
                }}>
                Проверить соединение
              </Button>
            </Form.Item>
            <Form.Item style={{ flexGrow: 1 }}>
              <Button
                onClick={async () => {
                  try {
                    const res = await runRefreshOrders()
                    setMsg(JSON.stringify(res.data, null, 2))
                    message.success('Обновлено')
                  } catch (e) {
                    if (axios.isAxiosError(e)) {
                      message.error(e.response?.data)
                    }
                  }
                }}>
                Вручную обновить заказы
              </Button>
            </Form.Item>
            <Form.Item style={{ flexGrow: 1 }}>
              <Button
                onClick={async () => {
                  try {
                    const res = await runUpdateWildberriesStocks()
                    console.log(res.data)
                    setMsg(JSON.stringify(res.data, null, 2))
                    message.success('Обновлено')
                  } catch (e) {
                    console.log(e)
                    if (axios.isAxiosError(e)) {
                      message.error(e.response?.data)
                    }
                  }
                }}
                htmlType='submit'>
                Вручную обновить отсатки
              </Button>
            </Form.Item>
          </div>
        </Form>
      )}
      {/* <pre>{msg}</pre> */}
    </Card>
  )
}

import { Button, Card, Form, Input, message } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  checkWildberriesConnection,
  getWildberriesSettings,
  runRefreshOrders,
  runUpdateWildberriesStocks,
  updateWildberriesSettings,
} from '../../../api/wildberries'
import WarehouseSelect from '../../warehouses/WarehouseSelect'

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
              await updateWildberriesSettings(
                e.sender_warehouse,
                e.send_cron,
                e.update_orders_cron
              )
              message.success('Обновлено')
            } catch (e) {
              console.log(e)
              if (axios.isAxiosError(e)) {
                message.error(e.response?.data)
              }
            }
            console.log(e)
          }}>
          <WarehouseSelect
            label={'Склад отправки'}
            name={'sender_warehouse'}
            required={false}
          />
          <Form.Item label='Интервал отправки (cron)' name='send_cron'>
            <Input placeholder='Интервал отправки (cron)' />
          </Form.Item>
          <Form.Item
            label='Интервал обновления заказов (cron)'
            name='update_orders_cron'>
            <Input placeholder='Интервал обновления заказов (cron)' />
          </Form.Item>
          <Form.Item label='API ключ' name='api_key'>
            <TextArea placeholder='API ключ' />
          </Form.Item>
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
                    console.log(res.data)
                    setMsg(JSON.stringify(res.data, null, 2))
                    message.success('Обновлено')
                  } catch (e) {
                    console.log(e)
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

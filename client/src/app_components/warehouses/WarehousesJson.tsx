import { Button, Card, Form, InputNumber, message } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  getJsonCategories,
  getJsonProducts,
  getJsonStocks,
  getWildberriesSettings,
  products_url,
  updateWildberriesSettings,
} from '../../api/api'
import downloadJson from '../../downloadJson'
import WarehouseSelect from './WarehouseSelect'

export default function WarehousesJson() {
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
    <Card title='Обмен JSON'>
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
            label={'Склад'}
            name='warehouse_send'
            required={false}
          />
          <Form.Item
            name='sell_price'
            label='Коэффициент цены розничной продажи'>
            <InputNumber></InputNumber>
          </Form.Item>
          <Form.Item name='opt_price' label='Коэффициент цены опт продажи'>
            <InputNumber></InputNumber>
          </Form.Item>
          <WarehouseSelect
            label='Склад резервирования'
            name='warehouse_reserve'
            required={false}
          />
          <Form.Item label='Токен' name='token'>
            <TextArea placeholder='Токен' />
          </Form.Item>
          <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
            <Form.Item style={{ flexGrow: 1 }}>
              <Button type='primary' htmlType='submit'>
                Обновить настройки
              </Button>
            </Form.Item>
          </div>
        </Form>
      )}
      {/* <pre>{msg}</pre> */}
    </Card>
  )
}

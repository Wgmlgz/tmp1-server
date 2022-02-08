import { Button, Card, Form, Input, message } from 'antd'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
  getWildberriesSettings,
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
              await updateWildberriesSettings(e.sender_warehouse, e.send_cron)
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
          <Form.Item name='send_cron'>
            <Input placeholder='Интервал отправки (cron)' />
          </Form.Item>
          <Form.Item>
            <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
              Обновить настройки
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              style={{ width: '100%' }}
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
        </Form>
      )}
      {/* <pre>{msg}</pre> */}
    </Card>
  )
}

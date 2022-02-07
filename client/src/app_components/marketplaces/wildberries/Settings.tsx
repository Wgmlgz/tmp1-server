import { Button, Card, Form, Input, message } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
import {
  runUpdateWildberriesStocks,
  updateWildberriesSettings,
} from '../../../api/wildberries'
import WarehouseSelect from '../../warehouses/WarehouseSelect'

export default function Settings() {
  const [msg, setMsg] = useState('')
  return (
    <Card title='Настройки wb'>
      <Form
        name='normal_login'
        className='login-form'
        onFinish={async e => {
          try {
            await updateWildberriesSettings(e.sender_warehouse, e.send_interval)
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
        <Form.Item name='send_interval'>
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
      <pre>{msg}</pre>
    </Card>
  )
}

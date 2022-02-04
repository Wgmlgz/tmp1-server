import { Form, message, Select } from 'antd'
import axios from 'axios'
import React, { FC, useEffect, useState } from 'react'
import { getWarehouses } from '../../api/api'
import { IWarehouseFull } from './WarehouseForm'
const { Option } = Select

interface Props {
  default_value?: string
  label: string
  name: string
  locked?: boolean
}
const WarehouseSelect: FC<Props> = ({ default_value, label, name, locked }) => {
  const [warehouses, setWarehouses] = useState<IWarehouseFull[]>([])

  useEffect(() => {
    const setup = async () => {
      try {
        const res_warehouses = await getWarehouses()
        setWarehouses(res_warehouses.data)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          message.error(err.response?.data)
        }
      }
    }
    setup()
  }, [default_value])
  return (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: 'Пожалуйста выберете склад!' }]}>
      {locked ? (
        <p style={{ paddingTop: '5px' }}>
          {warehouses.filter(warehouse => warehouse._id === default_value).at(0)?.name}
        </p>
      ) : (
        <Select defaultValue={default_value} style={{ width: '200px' }}>
          {warehouses.map(warehouse => (
            <Option value={warehouse._id}>{warehouse.name}</Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
}

export default WarehouseSelect

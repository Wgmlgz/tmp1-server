import { Card, Checkbox, message, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import React, { FC, useEffect, useState } from 'react'
import { superAdminGetUsers, superAdminUpdateUser } from '../../api/api'

export interface IUser {
  _id: string
  email: string
  admin: boolean
  content_manager: boolean
  super_admin: boolean
}

const SuperAdminUsers: FC = () => {
  const [users, setUsers] = useState<IUser[]>([])

  const setup = async () => {
    try {
      const res = await superAdminGetUsers()
      setUsers(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }
  useEffect(() => {
    setup()
  }, [])

  const columns: ColumnsType<IUser> = [
    {
      title: 'Электронная почта',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Админ',
      dataIndex: 'admin',
      key: 'admin',
      render: (text, record, index) => (
        <div>
          <Checkbox
            checked={record.admin}
            disabled={record.super_admin}
            onChange={async e => {
              try {
                const new_admin = e.target.checked
                await superAdminUpdateUser(
                  record._id,
                  new_admin,
                  record.content_manager
                )
                const new_users = [...users]
                new_users[index].admin = new_admin
                setUsers(new_users)
                message.success('Сохранено')
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}
          />
        </div>
      ),
    },
    {
      title: 'Контент-менеджер',
      dataIndex: 'content_manager',
      key: 'content_manager',
      render: (text, record, index) => (
        <div>
          <Checkbox
            checked={record.content_manager}
            disabled={record.super_admin}
            onChange={async e => {
              try {
                const new_content_manager = e.target.checked
                await superAdminUpdateUser(
                  record._id,
                  record.admin,
                  new_content_manager
                )
                const new_users = [...users]
                new_users[index].content_manager = new_content_manager
                setUsers(new_users)
                message.success('Сохранено')
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}
          />
        </div>
      ),
    },
    {
      title: 'Супер админ',
      dataIndex: 'super_admin',
      key: 'super_admin',
      render: (text, record, index) => (
        <div>
          <Checkbox checked={record.super_admin} disabled={true} />
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'grid', width: 'fit-content', gap: '20px' }}>
      <Card title='Список пользователей'>
        <Table
          dataSource={users?.map((x, i) => ({ ...x, key: i }))}
          columns={columns}
        />
      </Card>
    </div>
  )
}

export default SuperAdminUsers

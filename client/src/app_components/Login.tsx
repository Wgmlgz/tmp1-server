import axios from 'axios'
import { getUser, login } from '../api/api'
import { Form, Input, Button, Alert, message } from 'antd'
import { FC, useState } from 'react'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

const LoginForm: FC = () => {
  const [err_msg, setErrMsg] = useState('')
  const onFinish = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    try {
      await login(email, password)
      setErrMsg('')
      const user = await getUser()
      if (
        !user.data.content_manager &&
        !user.data.admin &&
        !user.data.super_admin
      ) {
        message.error('Вы не админ')
      } else {
        window.location.replace('/dashboard')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setErrMsg(err.response?.data)
      }
    }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        placeItems: 'center',
      }}>
      <div>
        <Form
          name='normal_login'
          className='login-form'
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}>
          <Form.Item>
            {err_msg && <Alert type='error' message={err_msg} />}
          </Form.Item>
          <Form.Item
            name='email'
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите свой адрес электронной почты!',
              },
            ]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Электронная почта'
            />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[
              {
                required: true,
                message: 'Пожалуйста, введите свой пароль!',
              },
            ]}>
            <Input
              prefix={<LockOutlined className='site-form-item-icon' />}
              type='password'
              placeholder='Пароль'
            />
          </Form.Item>
          <Form.Item>
            <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
              Войти
            </Button>
            Или <a href='/register'>зарегистрируйтесь сейчас!</a>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default LoginForm

import axios from 'axios'
import { login } from '../api/api'
import 'antd/dist/antd.css'
import { Form, Input, Button, Alert } from 'antd'
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
    console.log(email, password)
    try {
      const res = await login(email, password)
      setErrMsg('')
      window.location.replace('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err)
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
            {err_msg && (
              <Alert type='error' message={err_msg}>
                aboba
              </Alert>
            )}
          </Form.Item>
          <Form.Item
            name='email'
            rules={[
              {
                required: true,
                message: 'Please input your Email!',
              },
            ]}>
            <Input
              prefix={<UserOutlined className='site-form-item-icon' />}
              placeholder='Email'
            />
          </Form.Item>
          <Form.Item
            name='password'
            rules={[
              {
                required: true,
                message: 'Please input your Password!',
              },
            ]}>
            <Input
              prefix={<LockOutlined className='site-form-item-icon' />}
              type='password'
              placeholder='Password'
            />
          </Form.Item>
          <Form.Item>
            <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
              Log in
            </Button>
            Or <a href='/register'>register now!</a>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default LoginForm

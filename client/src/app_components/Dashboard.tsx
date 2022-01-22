import React, { useCallback, useEffect, useState } from 'react'
import 'antd/dist/antd.css'
import { Button, Layout, Menu } from 'antd'
import {
  UnorderedListOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { getUser, logout } from '../api/api'
import SuperAdminUsers from './super_admin/SuperAdminUsers'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Link,
  useParams,
  Routes,
} from 'react-router-dom'
import Categories from './categories/Categories'
import Products from './products/Products'

const { Header, Content, Footer, Sider } = Layout
const { SubMenu } = Menu

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState('loading...')

  const setup = useCallback(async () => {
    try {
      let res = await getUser()
      setUser(res.data)
    } catch (err) {
      window.location.replace('/login')
    }
  }, [])

  useEffect(() => {
    setup()
  }, [setup])

  const onCollapse = (collapsed: boolean) => {
    console.log(collapsed)
    setCollapsed(collapsed)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className='site-layout-background'>
        <div
          style={{
            display: 'flex',
            placeItems: 'center',
            gap: '20px',
          }}>
          <div style={{ fontWeight: 'bold', color: 'white', fontSize: '2em' }}>
            NAME
          </div>
          <div
            style={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: '1.2em',
              marginLeft: 'auto',
            }}>
            {user}
          </div>
          <Button
            type='primary'
            onClick={async () => {
              try {
                await logout()
              } catch {}
              window.location.replace('/login')
            }}>
            logout
          </Button>
        </div>
      </Header>
      <Layout className='site-layout'>
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          <div className='logo' />
          <Menu theme='dark' defaultSelectedKeys={['1']} mode='inline'>
            <Menu.Item key='1' icon={<UserOutlined />}>
              <Link to='/dashboard/users'>Users</Link>
            </Menu.Item>
            <Menu.Item key='2' icon={<UnorderedListOutlined />}>
              <Link to='/dashboard/categories'>Categories</Link>
            </Menu.Item>
            <Menu.Item key='3' icon={<AppstoreOutlined />}>
              <Link to='/dashboard/products'>Products</Link>
            </Menu.Item>
            {/* <SubMenu key='sub1' icon={<UserOutlined />} title='User'>
              <Menu.Item key='3'>Tom</Menu.Item>
              <Menu.Item key='4'>Bill</Menu.Item>
              <Menu.Item key='5'>Alex</Menu.Item>
            </SubMenu>
            <SubMenu key='sub2' icon={<TeamOutlined />} title='Team'>
              <Menu.Item key='6'>Team 1</Menu.Item>
              <Menu.Item key='8'>Team 2</Menu.Item>
            </SubMenu>
            <Menu.Item key='9' icon={<FileOutlined />}>
              Files
            </Menu.Item> */}
          </Menu>
        </Sider>
        <Content style={{ margin: '20px' }}>
          <div>
            <div>
              <Routes>
                <Route path='/users' element={<SuperAdminUsers />} />
                <Route path='/categories' element={<Categories />} />
                <Route path='/products' element={<Products />} />
              </Routes>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

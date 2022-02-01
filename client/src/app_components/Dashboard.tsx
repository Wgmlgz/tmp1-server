import { useCallback, useEffect, useState } from 'react'
import 'antd/dist/antd.css'
import { Button, Layout, Menu, message } from 'antd'
import {
  UnorderedListOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { getUser, logout } from '../api/api'
import SuperAdminUsers from './super_admin/SuperAdminUsers'
import { Route, Link, Routes } from 'react-router-dom'
import Categories from './categories/Categories'
import Products from './products/Products'

import { PicCenterOutlined } from '@ant-design/icons'
import Warehouses from './warehouses/Warehouses'
import ProductsIn from './warehouses/ProductsIn'
import ProductsOut from './warehouses/ProductsOut'
import ProductsMove from './warehouses/ProductsMove'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>('loading...')

  const setup = useCallback(async () => {
    try {
      let res = await getUser()
      setUser(res.data)
      if (!res.data.admin && !res.data.super_admin) {
        window.location.replace('/login')
        message.error('Вы не админ')
      }
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
            MIRACLUS
          </div>
          <div
            style={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: '1.2em',
              marginLeft: 'auto',
            }}>
            {user.email}
          </div>
          <Button
            type='primary'
            onClick={async () => {
              try {
                await logout()
              } catch {}
              window.location.replace('/login')
            }}>
            выйти
          </Button>
        </div>
      </Header>
      <Layout className='site-layout'>
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          <div className='logo' />
          <Menu theme='dark' defaultSelectedKeys={['1']} mode='inline'>
            {user.super_admin && (
              <Menu.Item key='1' icon={<UserOutlined />}>
                <Link to='/dashboard/users'>Пользователи</Link>
              </Menu.Item>
            )}
            <SubMenu key='sub1' icon={<AppstoreOutlined />} title='Продукты'>
              <Menu.Item key='2' icon={<AppstoreOutlined />}>
                <Link to='/dashboard/products'>Продукты</Link>
              </Menu.Item>
              <Menu.Item key='3' icon={<UnorderedListOutlined />}>
                <Link to='/dashboard/categories'>Категории</Link>
              </Menu.Item>
            </SubMenu>
            <SubMenu key='sub2' icon={<PicCenterOutlined />} title='Склады'>
              <Menu.Item key='4' icon={<PicCenterOutlined />}>
                <Link to='/dashboard/warehouses'>Склады</Link>
              </Menu.Item>
              <Menu.Item key='5' icon={<PicCenterOutlined />}>
                <Link to='/dashboard/products_in'>Приходы</Link>
              </Menu.Item>
              <Menu.Item key='6' icon={<PicCenterOutlined />}>
                <Link to='/dashboard/products_out'>Списания</Link>
              </Menu.Item>
              <Menu.Item key='7' icon={<PicCenterOutlined />}>
                <Link to='/dashboard/products_move'>Перемещения</Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Content style={{ margin: '20px' }}>
          <div>
            <Routes>
              <Route path='/categories' element={<Categories />} />
              <Route path='/users' element={<SuperAdminUsers />} />
              <Route path='/products' element={<Products />} />
              <Route path='/warehouses' element={<Warehouses />} />
              <Route path='/products_in' element={<ProductsIn />} />
              <Route path='/products_out' element={<ProductsOut />} />
              <Route path='/products_move' element={<ProductsMove />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

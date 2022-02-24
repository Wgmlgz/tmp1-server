import { useCallback, useEffect, useState } from 'react'
import 'antd/dist/antd.css'
import { Badge, Button, Layout, Menu, message, notification } from 'antd'
import {
  UnorderedListOutlined,
  UserOutlined,
  AppstoreOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { getNotifications, getUser, logout } from '../api/api'
import SuperAdminUsers from './super_admin/SuperAdminUsers'
import { Route, Link, Routes } from 'react-router-dom'
import Categories from './categories/Categories'
import Products from './products/Products'

import { PicCenterOutlined } from '@ant-design/icons'
import Warehouses from './warehouses/Warehouses'
import ProductsIn from './warehouses/ProductsIn'
import ProductsOut from './warehouses/ProductsOut'
import ProductsMove from './warehouses/ProductsMove'
import Import from './excel/Import'
import WildberriesProducts from './marketplaces/wildberries/Products'
import Settings from './marketplaces/wildberries/Settings'
import Orders from './marketplaces/wildberries/Orders'
import Notifications from './notifications/Notifications'
import { NotificationFilled } from '@ant-design/icons'
import axios from 'axios'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>('loading...')
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications()
      setNotifications(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }
  useEffect(() => {
    fetchNotifications()
  }, [])

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
          <div
            style={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: '2em',
              flexGrow: 1,
            }}>
            MIRACLUS
          </div>
          <Link
            to='/dashboard/notifications'
            style={{
              backgroundColor: '#ffffff',
              paddingLeft: '15px',
              paddingRight: '15px',
            }}>
            <Badge count={notifications.length}>
              <div style={{ margin: '10px' }}>
                <NotificationFilled />
              </div>
            </Badge>
          </Link>
          <div
            style={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: '1.2em',
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
            <SubMenu key='sub1' icon={<AppstoreOutlined />} title='Товары'>
              <Menu.Item key='2' icon={<AppstoreOutlined />}>
                <Link to='/dashboard/products'>Товары</Link>
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
            <Menu.Item key='8' icon={<ImportOutlined />}>
              <Link to='/dashboard/import'>Импорт</Link>
            </Menu.Item>
            <SubMenu
              key='sub3'
              icon={<PicCenterOutlined />}
              title='Маркетплейсы'>
              <SubMenu
                key='sub4'
                icon={<PicCenterOutlined />}
                title='Wildberries'>
                <Menu.Item key='9' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/marketplaces/wildberries/products'>
                    Товары
                  </Link>
                </Menu.Item>
                <Menu.Item key='10' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/marketplaces/wildberries/settings'>
                    Настройки
                  </Link>
                </Menu.Item>
                <Menu.Item key='11' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/marketplaces/wildberries/orders'>
                    Заказы
                  </Link>
                </Menu.Item>
              </SubMenu>
            </SubMenu>
          </Menu>
        </Sider>
        <Content style={{ margin: '20px' }}>
          <div>
            <Routes>
              <Route path='/notifications' element={<Notifications />} />
              <Route path='/categories' element={<Categories />} />
              <Route path='/users' element={<SuperAdminUsers />} />
              <Route path='/products' element={<Products />} />
              <Route path='/warehouses' element={<Warehouses />} />
              <Route path='/products_in' element={<ProductsIn />} />
              <Route path='/products_out' element={<ProductsOut />} />
              <Route path='/products_move' element={<ProductsMove />} />
              <Route path='/import' element={<Import />} />
              <Route
                path='/marketplaces/wildberries/products'
                element={<WildberriesProducts />}
              />
              <Route
                path='/marketplaces/wildberries/settings'
                element={<Settings />}
              />
              <Route
                path='/marketplaces/wildberries/orders'
                element={<Orders />}
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

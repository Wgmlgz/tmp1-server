import { useCallback, useEffect, useState } from 'react'
import { Badge, Button, Layout, Menu, message, notification } from 'antd'
import {
  UnorderedListOutlined,
  UserOutlined,
  AppstoreOutlined,
  ImportOutlined,
  DownloadOutlined,
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
import Backup from './Backup'
import WildberriesProducts from './marketplaces/wildberries/Products'
import Settings from './marketplaces/wildberries/Settings'
import Orders from './marketplaces/wildberries/Orders'
import Notifications from './notifications/Notifications'
import { NotificationFilled } from '@ant-design/icons'
import axios from 'axios'
import WarehousesJson from './warehouses/WarehousesJson'
import { Analytics } from './warehouses/Analytics'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<any>('loading...')
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = async () => {
    if (!(user.admin || user.super_admin)) return
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
      if (
        !res.data.content_manager &&
        !res.data.admin &&
        !res.data.super_admin
      ) {
        window.location.replace('/login')
        message.error('???? ???? ??????????')
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
          {(user.admin || user.super_admin) && (
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
          )}
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
            ??????????
          </Button>
        </div>
      </Header>
      <Layout className='site-layout'>
        <Sider collapsible collapsed={collapsed} onCollapse={onCollapse}>
          <div className='logo' />
          <Menu theme='dark' defaultSelectedKeys={['1']} mode='inline'>
            {user.super_admin && (
              <Menu.Item key='1' icon={<UserOutlined />}>
                <Link to='/dashboard/users'>????????????????????????</Link>
              </Menu.Item>
            )}
            <SubMenu key='sub1' icon={<AppstoreOutlined />} title='????????????'>
              <Menu.Item key='2' icon={<AppstoreOutlined />}>
                <Link to='/dashboard/products'>????????????</Link>
              </Menu.Item>
              <Menu.Item key='3' icon={<UnorderedListOutlined />}>
                <Link to='/dashboard/categories'>??????????????????</Link>
              </Menu.Item>
            </SubMenu>
            {(user.admin || user.super_admin) && (
              <SubMenu key='sub2' icon={<PicCenterOutlined />} title='????????????'>
                <Menu.Item key='4' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/warehouses'>????????????</Link>
                </Menu.Item>
                <Menu.Item key='5' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/products_in'>??????????????</Link>
                </Menu.Item>
                <Menu.Item key='6' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/products_out'>????????????????</Link>
                </Menu.Item>
                <Menu.Item key='7' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/products_move'>??????????????????????</Link>
                </Menu.Item>
                <Menu.Item key='77' icon={<PicCenterOutlined />}>
                  <Link to='/dashboard/json'>?????????? JSON</Link>
                </Menu.Item>
              </SubMenu>
            )}
            <Menu.Item key='8' icon={<ImportOutlined />}>
              <Link to='/dashboard/import'>????????????</Link>
            </Menu.Item>
            {(user.admin || user.super_admin) && (
              <SubMenu
                key='sub3'
                icon={<PicCenterOutlined />}
                title='????????????????????????'>
                <SubMenu
                  key='sub4'
                  icon={<PicCenterOutlined />}
                  title='Wildberries'>
                  <Menu.Item key='9' icon={<PicCenterOutlined />}>
                    <Link to='/dashboard/marketplaces/wildberries/products'>
                      ????????????
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='10' icon={<PicCenterOutlined />}>
                    <Link to='/dashboard/marketplaces/wildberries/settings'>
                      ??????????????????
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='11' icon={<PicCenterOutlined />}>
                    <Link to='/dashboard/marketplaces/wildberries/orders'>
                      ????????????
                    </Link>
                  </Menu.Item>
                  <Menu.Item key='12' icon={<PicCenterOutlined />}>
                    <Link to='/dashboard/marketplaces/wildberries/analytics'>
                      ??????????????????
                    </Link>
                  </Menu.Item>
                </SubMenu>
              </SubMenu>
            )}
            {user.super_admin && (
              <Menu.Item key='sub43' icon={<DownloadOutlined />} title='??????????'>
                <Link to='/dashboard/backup'>??????????</Link>
              </Menu.Item>
            )}
          </Menu>
        </Sider>
        <Content style={{ margin: '20px' }}>
          <div>
            <Routes>
              <Route path='/notifications' element={<Notifications />} />
              <Route path='/categories' element={<Categories />} />
              <Route path='/users' element={<SuperAdminUsers />} />
              <Route path='/products' element={<Products />} />
              <Route path='/json' element={<WarehousesJson />} />
              <Route path='/warehouses' element={<Warehouses />} />
              <Route path='/products_in' element={<ProductsIn />} />
              <Route path='/products_out' element={<ProductsOut />} />
              <Route path='/products_move' element={<ProductsMove />} />
              <Route path='/import' element={<Import />} />
              <Route path='/backup' element={<Backup />} />
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
              <Route
                path='/marketplaces/wildberries/analytics'
                element={<Analytics />}
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

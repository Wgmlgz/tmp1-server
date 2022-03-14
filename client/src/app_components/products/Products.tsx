import {
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Table,
} from 'antd'
import { Key, useEffect, useState } from 'react'
import {
  createProduct,
  createWbProduct,
  getCategories,
  getProducts,
  getProductsCount,
  getStats,
  getWarehouses,
  products_url,
  removeProducts,
  searchProducts,
  updateManyProducts,
  updateProduct,
} from '../../api/api'
import {
  DeleteOutlined,
  EditOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import axios from 'axios'
import { TablePaginationConfig } from 'antd/lib/table'
import { ICategory } from '../categories/Categories'
import ProductsForm, { IProductFull } from './ProductsForm'
import moment from 'moment'
import Barcodes from './Barcodes'

import reactStringReplace from 'react-string-replace'
import { getRemains } from '../../api/api'
import { IWarehouseFull } from '../warehouses/WarehouseForm'
import FullscreenCard from '../FullscreenCard'
import ru_RU from 'antd/lib/locale/ru_RU'
import { Image } from 'antd'

import { exportProducts } from './Excel'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import useColumns from '../../hooks/useColumns'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const highlightText = (str: string, search: string) => (
  <span>
    {search
      ? reactStringReplace(str, new RegExp(`(${search})+`, 'g'), (match, i) => (
          <span key={i} style={{ fontWeight: 'bold' }}>
            {match}
          </span>
        ))
      : str}
  </span>
)

const { Option } = Select
const { RangePicker } = DatePicker

interface IRemain {
  product: string
  warehouse: string
  quantity: number
}

const Products = () => {
  const [products, setProducts] = useState<IProductFull[]>([])

  const [product_creation, setProductCreation] = useState<boolean>(false)
  const [barcodes_creation, setBarcodesCreation] = useState('')
  const [categories, setCategories] = useState<string[]>([])

  const [active_products, setActiveProducts] = useState<IProductFull[]>([])
  const [active_category, setActiveCategory] = useState<string>('')

  const [edited_product_id, setEditedProductId] = useState<string>('')
  const [edited_product, setEditedProduct] = useState<IProductFull>()
  const [selected_row_keys, setSelectedRowKeys] = useState<Key[]>([])
  const [selected_products, setSelectedProducts] = useState<IProductFull[]>([])

  const [search_query, setSearchQuery] = useState<string>('')

  /** maps product_id to warehouse-count */
  const [remains_map, setRemainsMap] = useState(new Map<string, string>())

  const [pagination, setPagination] = useState<TablePaginationConfig>({})
  // fetch
  // const [loading, setLoading] = useState(false)

  const [stats, setStats] = useState<IProductFull>()
  const [statsStart, setStatsStart] = useState(new Date())
  const [statsEnd, setStatsEnd] = useState(new Date())

  const [statsData, setStatsData] = useState<{
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
    }[]
  }>({ labels: [], datasets: [] })

  useEffect(() => {
    const set = new Set(selected_row_keys)
    setSelectedProducts(products.filter(product => set.has(product._id)))
  }, [products, selected_row_keys])
  const refreshProducts = (products: IProductFull[], category: string) => {
    setActiveProducts(
      products.filter(product => !category || product.category === category)
    )
  }
  const fetchProducts = async () => {
    try {
      const categories_res = await getCategories()
      setCategories(
        categories_res.data.map((category: ICategory) => category.name)
      )

      const res = await getProducts(
        0,
        1000000000000
        // pagination.current ?? 0,
        // pagination.pageSize ?? 10
      )
      const res_warehouses = await getWarehouses()
      const warehouses_map = new Map<string, string>(
        res_warehouses.data.map((warehouse: IWarehouseFull) => [
          warehouse._id,
          warehouse.name,
        ])
      )

      const remains_res = await getRemains()

      const map = new Map<string, string>()
      remains_res.data.forEach((remain: IRemain) => {
        const str = `${warehouses_map.get(remain.warehouse)} - ${
          remain.quantity
        }`
        const old = map.get(remain.product)
        map.set(remain.product, old ? `${old}\n${str}` : str)
      })
      setRemainsMap(map)
      setPagination({
        ...pagination,
        total: (await getProductsCount()).data,
      })
      setSearchQuery('')
      setProducts(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }
  useEffect(() => {
    refreshProducts(products, active_category)
  }, [active_category, products])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useColumns<IProductFull>(
    'main_products',
    [
      {
        title: 'Изображение',
        dataIndex: 'img',
        key: 'type',
        render: (text, record, index) =>
          record.imgs_big &&
          record.imgs_big[0] && (
            <Image
              width={100}
              src={`${products_url}/img/${record.imgs_big[0]}`}
            />
          ),
      },
      {
        title: 'Артикул',
        dataIndex: 'article',
        key: 'article',
        render: (text, record, index) =>
          highlightText(record.article || '', search_query),
      },
      {
        title: 'Штрихкод',
        dataIndex: 'barcode',
        key: 'barcode',
        render: (text, record, index) =>
          highlightText(record.barcode || '', search_query),
      },
      {
        title: 'Имя',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record, index) => (
          <p>{highlightText(record.name || '', search_query)}</p>
        ),
      },
      {
        title: 'Закупочная цена',
        dataIndex: 'buy_price',
        key: 'buy_price',
        sorter: (a, b) =>
          Number.parseInt(a.buy_price) - Number.parseInt(b.buy_price),
      },
      {
        title: 'Цена доставки',
        dataIndex: 'delivery_price',
        key: 'delivery_price',
        sorter: (a, b) =>
          Number.parseInt(a.delivery_price) - Number.parseInt(b.delivery_price),
      },
      {
        title: 'Создан',
        dataIndex: 'created',
        key: 'created',
        render: (text, record, index) =>
          moment(record.created).format('DD-MM-GGGG'),
        sorter: (a, b) => moment(a.created).unix() - moment(b.created).unix(),
      },
      {
        title: 'Количество',
        dataIndex: 'count',
        key: 'count',
      },
      {
        title: 'Изменить/Удалить',
        dataIndex: 'name',
        key: 'edit',
        render: (text, record, index) => (
          <span style={{ display: 'flex', gap: '10px' }}>
            <Button
              onClick={() => {
                setEditedProductId(record._id)
                setEditedProduct(record)
              }}>
              <EditOutlined />
            </Button>
            <Popconfirm
              onCancel={() => {}}
              onConfirm={async () => {
                try {
                  await removeProducts([record?._id ?? ''])
                  await fetchProducts()
                  setEditedProductId('')
                  message.success('Продукт удален')
                } catch (e) {
                  if (axios.isAxiosError(e)) {
                    message.error(e.response?.data)
                  }
                }
              }}
              title={`Вы точно хотите безвозвратно удалить товар?`}
              okText='Да'
              cancelText='Нет'>
              <Button>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
            <Button
              onClick={() => {
                setStats(record)
              }}>
              <BarChartOutlined />
            </Button>
          </span>
        ),
      },
    ],
    [search_query]
  )

  // const fetchProductsPagination = async (pagination: TablePaginationConfig) => {
  //   setLoading(true)
  //   try {
  //     const res = await getProducts(
  //       0,
  //       99999999999
  //       // pagination.current ?? 1,
  //       // pagination.pageSize ?? 10
  //     )
  //     const res_count = await getProductsCount()
  //     setPagination({
  //       pageSize: pagination.pageSize || 1,
  //       current: pagination.current || 1,
  //       total: res_count.data,
  //     })

  //     setProducts(res.data)
  //   } catch (err) {
  //     if (axios.isAxiosError(err)) {
  //       message.error(err.response?.data)
  //     }
  //   }
  //   setLoading(false)
  // }

  // 'brand', 'supplier'
  const [massEdit, setMassEdit] = useState<string[]>()
  const [options, setOptions] = useState(['brand'])

  const fetchAllProducts = async () => {
    const res = await getProducts(1, 10000000)
    return res.data
  }

  useEffect(() => {
    ;(async () => {
      if (!stats) return

      try {
        const res = await getStats(statsStart, statsEnd, stats?._id)
        const data = res.data
        const map = new Map<string, number>()
        data.forEach(
          ({ platform, amount }: { platform: string; amount: number }) => {
            map.set(platform, (map.get(platform) ?? 0) + amount)
          }
        )
        console.log(data)
        const new_stats = {
          labels: [...map.entries()].map(x => x[0]),
          datasets: [
            {
              backgroundColor: '#ff5555',
              data: [...map.entries()].map(x => x[1]),
              label: stats.name,
            },
          ],
        }
        setStatsData(new_stats)
      } catch (e) {
        if (axios.isAxiosError(e)) {
          message.error(e.response?.data)
        }
      }
    })()
  }, [stats, statsEnd, statsStart])

  return (
    <>
      {barcodes_creation && (
        <FullscreenCard
          onCancel={() => {
            setBarcodesCreation('')
          }}>
          <Barcodes
            barcodes={
              barcodes_creation === 'barcodes all'
                ? products.map(product => ({
                    barcode: product.barcode || '',
                    name: product.name || '',
                    article: product.article || '',
                  }))
                : barcodes_creation === 'barcodes wb'
                ? selected_products
                    .filter(
                      product =>
                        product.marketplace_data &&
                        !!product.marketplace_data['Штрихкод Wildberries FBS']
                    )
                    .map((product: any) => ({
                      barcode:
                        product.marketplace_data['Штрихкод Wildberries FBS'],
                      name: product.name || '',
                      article: product.article || '',
                      color: product.color || '',
                    }))
                : selected_products.map(product => ({
                    barcode: product.barcode || '',
                    name: product.name || '',
                    article: product.article || '',
                  }))
            }
          />
        </FullscreenCard>
      )}
      <div style={{ width: '100%' }}>
        <Card>
          <div
            style={{
              display: 'flex',
              placeItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
            }}>
            <h2>Все товары</h2>
            <Popconfirm
              onCancel={() => {}}
              onConfirm={async () => {
                try {
                  await removeProducts(
                    selected_products.map(product => product._id)
                  )
                  await fetchProducts()
                  message.success('Товары удалены')
                } catch (e) {
                  if (axios.isAxiosError(e)) {
                    message.error(e.response?.data)
                  }
                }
              }}
              title={`Вы точно хотите безвозвратно удалить ${selected_products.length} товаров?`}
              okText='Да'
              cancelText='Нет'>
              <Button>Удалить товары</Button>
            </Popconfirm>
            <Popover
              content={
                <form
                  onSubmit={async (e: any) => {
                    e.preventDefault()

                    try {
                      await createWbProduct(e.target.url.value)
                      await fetchProducts()
                      message.success('Товар добавлен')
                    } catch (e) {
                      if (axios.isAxiosError(e)) {
                        message.error(e.response?.data)
                      }
                    }
                  }}>
                  <Input name='url' placeholder='ссылка...' />
                  <Button htmlType='submit'>Добавить</Button>
                </form>
              }>
              <Button>Добавить с WB</Button>
            </Popover>
            <div style={{ display: 'grid' }}>
              <Select
                style={{ width: 300 }}
                value={'Напечатать штрихкоды'}
                onSelect={async (e: any) => {
                  if (e === 'barcodes all') {
                    await fetchAllProducts()
                  }
                  setBarcodesCreation(e)
                }}>
                <Option value='barcodes'>Напечатать штрихкоды</Option>
                <Option value='barcodes all'>
                  Напечатать штрихкоды всех товаров
                </Option>
                <Option value='barcodes wb'>
                  Напечатать штрихкоды Wildberries FB
                </Option>
              </Select>
            </div>
            <Input.Search
              style={{ maxWidth: '500px' }}
              placeholder='поиск'
              onSearch={async e => {
                try {
                  const res = await searchProducts(e, options)
                  setSearchQuery(e)
                  setProducts(res.data)
                } catch (e) {
                  if (axios.isAxiosError(e)) {
                    message.error(e.response?.data)
                  }
                }
              }}
              suffix={
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item>
                        <Checkbox
                          checked={options.includes('brand')}
                          onChange={e => {
                            setOptions(
                              [...options, 'brand'].filter(
                                x => x !== 'brand' || e.target.checked
                              )
                            )
                          }}
                        />
                        <label> искать по брендам</label>
                      </Menu.Item>
                      <Menu.Item>
                        <Checkbox
                          checked={options.includes('provider')}
                          onChange={e => {
                            setOptions(
                              [...options, 'provider'].filter(
                                x => x !== 'provider' || e.target.checked
                              )
                            )
                          }}
                        />
                        <label> искать по поставщикам</label>
                      </Menu.Item>
                    </Menu>
                  }>
                  <Button type='text' style={{ margin: '-10px'}}>
                    опции
                  </Button>
                </Dropdown>
              }
            />
            <Button
              style={{ backgroundColor: '#98f379' }}
              onClick={() => {
                setProductCreation(true)
              }}>
              Создать новый товар
            </Button>
            <Select
              placeholder='Фильтр по категориям'
              style={{ width: '200px' }}
              onChange={e => {
                setActiveCategory(e)
              }}>
              <Option value=''>Все</Option>
              {categories.map((s, id) => (
                <Option key={id} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
            <Button
              onClick={() => {
                exportProducts(selected_products)
              }}>
              Экспорт excel
            </Button>
            <Button
              onClick={async () => {
                const products = await fetchAllProducts()
                exportProducts(products)
              }}>
              Экспорт excel(все)
            </Button>
            <Button
              onClick={() => {
                setMassEdit(selected_products.map(x => x._id))
              }}>
              Массовое редактирование
            </Button>

            {massEdit && (
              <FullscreenCard
                onCancel={() => {
                  setMassEdit(undefined)
                }}>
                <Card>
                  <Form
                    initialValues={{
                      delivery_price_option: 'set',
                      buy_price_option: 'set',
                    }}
                    onFinish={async e => {
                      // e.preventDefault()

                      try {
                        console.log(e)
                        console.log(massEdit)

                        await updateManyProducts(e, massEdit)
                        await fetchProducts()
                        message.success('Товары обновленны')
                      } catch (e) {
                        if (axios.isAxiosError(e)) {
                          message.error(e.response?.data)
                        }
                      }
                    }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Form.Item name='buy_price_option' label='Цены закупа'>
                        <Select style={{ width: '200px' }}>
                          <Option key={'percent'} value={'percent'}>
                            Измениние в процентах
                          </Option>
                          <Option key={'add'} value={'add'}>
                            Добавление
                          </Option>
                          <Option key={'set'} value={'set'}>
                            Установка
                          </Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name='buy_price'>
                        <InputNumber />
                      </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Form.Item
                        name='delivery_price_option'
                        label='Цены доставки'>
                        <Select style={{ width: '200px' }}>
                          <Option key={'percent'} value={'percent'}>
                            Измениние в процентах
                          </Option>
                          <Option key={'add'} value={'add'}>
                            Добавление
                          </Option>
                          <Option key={'set'} value={'set'}>
                            Установка
                          </Option>
                        </Select>
                      </Form.Item>
                      <Form.Item name='delivery_price'>
                        <InputNumber />
                      </Form.Item>
                    </div>

                    <Form.Item name='category' label='Категория'>
                      <Select placeholder='Категория'>
                        {categories.map((s, id) => (
                          <Option key={id} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item name='provider' label='Поставщик'>
                      <Input />
                    </Form.Item>
                    <Form.Item name='mark' label='Заметка'>
                      <Input />
                    </Form.Item>
                    <Form.Item name='country' label='Страна'>
                      <Input />
                    </Form.Item>
                    <Form.Item name='description' label='Описание'>
                      <Input />
                    </Form.Item>

                    <Form.Item name='height' label='Высота'>
                      <InputNumber />
                    </Form.Item>
                    <Form.Item name='length' label='Длина'>
                      <InputNumber />
                    </Form.Item>
                    <Form.Item name='width' label='Ширина'>
                      <InputNumber />
                    </Form.Item>
                    <Form.Item name='weight' label='Вес'>
                      <InputNumber />
                    </Form.Item>

                    <Form.Item name='brand' label='Бренд'>
                      <Input />
                    </Form.Item>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button
                        onClick={() => {
                          setMassEdit(undefined)
                        }}>
                        Отмена
                      </Button>
                      <Button htmlType='submit' type='primary'>
                        Массовое редактирование
                      </Button>
                    </div>
                  </Form>
                </Card>
              </FullscreenCard>
            )}
          </div>
          <br />

          <Table
            rowSelection={{
              selectedRowKeys: selected_row_keys,
              onChange: selectedRowKeys => {
                setSelectedRowKeys(selectedRowKeys)
              },
            }}
            // dataSource={active_products.map(t => ({ ...t, key: t._id }))}
            dataSource={active_products.map(t => ({
              ...t,
              key: t._id,
              count: (
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {remains_map.get(t._id)}
                </p>
              ),
            }))}
            columns={columns}
            loading={!products.length}
            // pagination={{
            //   ...pagination,
            //   pageSizeOptions: ['50', '100', '200'],
            //   // pageSizeOptions: ['1', '2', '3'],
            //   // pageSize: 1
            // }}
            // onChange={fetchProductsPagination}
          />
        </Card>
      </div>
      {product_creation && (
        <FullscreenCard onCancel={() => setProductCreation(false)}>
          <ProductsForm
            header='Создать новый товар'
            button='Создать'
            onSubmit={async product => {
              try {
                await createProduct(product)
                await fetchProducts()
                setProductCreation(false)
                message.success('Продукт создан')
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  String(err.response?.data)
                    .split(',')
                    .forEach(msg => message.error(msg))
                }
              }
            }}
          />
        </FullscreenCard>
      )}
      {edited_product_id && (
        <FullscreenCard onCancel={() => setEditedProductId('')}>
          <ProductsForm
            header='Изменить товар'
            button='Изменить'
            product={edited_product}
            onSubmit={async product => {
              try {
                await updateProduct(product, edited_product_id)
                await fetchProducts()
                message.success('Продукт обновлен')
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  String(err.response?.data)
                    .split(',')
                    .forEach(msg => message.error(msg))
                }
              }
            }}
            onRemove={async () => {
              try {
                await removeProducts([edited_product?._id ?? ''])
                await fetchProducts()
                setEditedProductId('')
                message.success('Продукт удален')
              } catch (e) {
                if (axios.isAxiosError(e)) {
                  message.error(e.response?.data)
                }
              }
            }}
          />
        </FullscreenCard>
      )}
      <Modal
        title='Статискика'
        visible={!!stats}
        onCancel={() => setStats(undefined)}
        footer={null}>
        <ConfigProvider locale={ru_RU}>
          <RangePicker
            onChange={e => {
              if (!e) return
              if (!e[0]) return
              if (!e[1]) return
              setStatsStart(e[0].toDate())
              setStatsEnd(e[1].toDate())
            }}
          />
        </ConfigProvider>

        <Bar
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: `Статиска по товару: '${stats?.name}'`,
              },
            },
          }}
          data={statsData}
        />
      </Modal>
    </>
  )
}

export default Products

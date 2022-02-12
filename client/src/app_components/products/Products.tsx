import { Button, Card, Input, message, Popconfirm, Select, Table } from 'antd'
import { Key, useEffect, useState } from 'react'
import {
  createProduct,
  getCategories,
  getProducts,
  getProductsCount,
  getWarehouses,
  products_url,
  removeProducts,
  searchProducts,
  updateProduct,
} from '../../api/api'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import axios from 'axios'
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table'
import { ICategory } from '../categories/Categories'
import ProductsForm, { IProductFull } from './ProductsForm'
import moment from 'moment'
import Barcodes from './Barcodes'

import reactStringReplace from 'react-string-replace'
import { getRemains } from '../../api/remains'
import { IWarehouseFull } from '../warehouses/WarehouseForm'
import FullscreenCard from '../FullscreenCard'

import { exportProducts } from './Excel'

export const highlightText = (str: string, search: string) => (
  <div>
    {search
      ? reactStringReplace(str, new RegExp(`(${search})+`, 'g'), (match, i) => (
          <span key={i} style={{ fontWeight: 'bold' }}>
            {match}
          </span>
        ))
      : str}
  </div>
)

const { Option } = Select

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
  const [loading, setLoading] = useState(false)

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
        pagination.current ?? 0,
        pagination.pageSize ?? 10
      )
      setPagination({ ...pagination, total: (await getProductsCount()).data })
      setSearchQuery('')
      setProducts(res.data)

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
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
      console.log(err)
    }
  }
  useEffect(() => {
    refreshProducts(products, active_category)
  }, [active_category, products])

  useEffect(() => {
    fetchProducts()
  }, [])

  const columns: ColumnsType<IProductFull> = [
    {
      title: 'Изображение',
      dataIndex: 'img',
      key: 'type',
      render: (text, record, index) =>
        record.imgs_small &&
        record.imgs_small[0] && (
          <img
            style={{ borderRadius: '20px', width: '100px' }}
            src={`${products_url}/img/${record.imgs_small[0]}`}
            alt='img'
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
      render: (text, record, index) => (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {remains_map.get(record._id)}
        </div>
      ),
    },
    {
      title: 'Изменить/Удалить',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <div style={{ display: 'flex', gap: '10px' }}>
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
            title={`Вы точно хотите безвозвратно удалить продукт?`}
            okText='Да'
            cancelText='Нет'>
            <Button>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  const fetchProductsPagination = async (pagination: TablePaginationConfig) => {
    try {
      setLoading(true)
      const res = await getProducts(
        pagination.current ?? 1,
        pagination.pageSize ?? 10
      )
      const res_count = await getProductsCount()
      setPagination({
        pageSize: pagination.pageSize || 1,
        current: pagination.current || 1,
        total: res_count.data,
      })

      setProducts(res.data)
      setLoading(false)
    } catch (err) {}
  }

  const fetchAllProducts = async () => {
    try {
      setLoading(true)
      const res = await getProducts(1, 10000000)
      const res_count = await getProductsCount()

      // setPagination({
      //   pageSize: pagination.pageSize || 1,
      //   current: pagination.current || 1,
      //   total: res_count.data,
      // })

      setProducts(res.data)
      setLoading(false)
    } catch (err) {}
  }

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
              gap: '20px',
              flexWrap: 'wrap',
            }}>
            <p style={{ fontWeight: 'bold', fontSize: '20px' }}>Все продукты</p>
            <Popconfirm
              onCancel={() => {}}
              onConfirm={async () => {
                try {
                  await removeProducts(
                    selected_products.map(product => product._id)
                  )
                  await fetchProducts()
                  message.success('Продукты удалены')
                } catch (e) {
                  if (axios.isAxiosError(e)) {
                    message.error(e.response?.data)
                  }
                }
              }}
              title={`Вы точно хотите безвозвратно удалить ${selected_products.length} продуктов?`}
              okText='Да'
              cancelText='Нет'>
              <Button>Удалить продукты</Button>
            </Popconfirm>
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
            <Input.Search
              style={{ maxWidth: '500px' }}
              placeholder='поиск'
              onSearch={async e => {
                try {
                  const res = await searchProducts(e)
                  setSearchQuery(e)
                  setProducts(res.data)
                } catch (e) {
                  if (axios.isAxiosError(e)) {
                    message.error(e.response?.data)
                  }
                }
              }}
            />
            <Button
              style={{ backgroundColor: '#98f379' }}
              onClick={() => {
                setProductCreation(true)
              }}>
              Создать новый продукт
            </Button>
            <Select
              placeholder='Фильтр по категориям'
              style={{ width: '200px' }}
              onChange={e => {
                setActiveCategory(e)
              }}>
              <Option value=''>Все</Option>
              {categories.map(s => (
                <Option value={s}>{s}</Option>
              ))}
            </Select>
            <Button
              onClick={() => {
                exportProducts(selected_products)
              }}>
              Экспорт excel
            </Button>
            <Button
              onClick={() => {
                exportProducts(products)
              }}>
              Экспорт excel(все)
            </Button>
          </div>
          <br />

          <Table
            rowSelection={{
              selectedRowKeys: selected_row_keys,
              onChange: selectedRowKeys => {
                setSelectedRowKeys(selectedRowKeys)
              },
            }}
            dataSource={active_products.map(t => ({ ...t, key: t._id }))}
            columns={columns}
            loading={loading}
            pagination={{
              ...pagination,
              pageSizeOptions: ['50', '100', '200'],
            }}
            onChange={fetchProductsPagination}
          />
        </Card>
      </div>
      {product_creation && (
        <FullscreenCard onCancel={() => setProductCreation(false)}>
          <ProductsForm
            header='Создать новый продукт'
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
            header='Изменить продукт'
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
    </>
  )
}

export default Products

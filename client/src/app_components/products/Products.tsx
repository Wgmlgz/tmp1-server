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

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

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

async function saveFile(fileName: string, workbook: ExcelJS.Workbook) {
  const xls64 = await workbook.xlsx.writeBuffer({ base64: true } as any)
  saveAs(
    new Blob([xls64], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName
  )
}

const Products = () => {
  const [products, setProducts] = useState<IProductFull[]>([])
  const [product_creation, setProductCreation] = useState<boolean>(false)
  const [barcodes_creation, setBarcodesCreation] = useState<boolean>(false)
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
      console.log(map)
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
      title: 'Имя (нажмите, чтобы изменить)',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record, index) => (
        <Button
          onClick={() => {
            setEditedProductId(record._id)
            setEditedProduct(record)
          }}>
          {highlightText(record.name || '', search_query)}
        </Button>
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
  ]

  const fetchProductsPagination = async (pagination: TablePaginationConfig) => {
    try {
      setLoading(true)
      const res = await getProducts(
        pagination.current ?? 0,
        pagination.pageSize ?? 10
      )
      const res_count = await getProductsCount()
      setPagination({
        pageSize: pagination.pageSize || 1,
        current: pagination.current || 1,
        total: res_count.data,
      })
      console.log(pagination)

      setProducts(res.data)
      setLoading(false)
    } catch (err) {}
  }
  return (
    <>
      {barcodes_creation && (
        <FullscreenCard
          onCancel={() => {
            setBarcodesCreation(false)
          }}>
          <Barcodes
            barcodes={selected_products.map(product => ({
              barcode: product.barcode || '',
              name: product.name || '',
              article: product.article || '',
            }))}
          />
        </FullscreenCard>
      )}
      <div style={{ width: '100%' }}>
        <Card
          title='Все продукты'
          extra={
            <div style={{ display: 'flex', gap: '20px' }}>
              <Button
                onClick={async () => {
                  const workbook = new ExcelJS.Workbook()
                  const worksheet = workbook.addWorksheet('My Sheet')

                  worksheet.columns = [
                    { header: 'type', key: 'type' },
                    { header: 'category', key: 'category' },
                    { header: 'article', key: 'article' },
                    { header: 'name', key: 'name' },
                    { header: 'description', key: 'description' },
                    { header: 'tags', key: 'tags' },
                    { header: 'imgs', key: 'imgs' },
                    { header: 'imgs_big', key: 'imgs_big' },
                    { header: 'imgs_small', key: 'imgs_small' },
                    { header: 'videos', key: 'videos' },
                    { header: 'buy_price', key: 'buy_price' },
                    { header: 'delivery_price', key: 'delivery_price' },
                    { header: 'height', key: 'height' },
                    { header: 'length', key: 'length' },
                    { header: 'width', key: 'width' },
                    { header: 'weight', key: 'weight' },
                    { header: 'brand', key: 'brand' },
                    { header: 'provider', key: 'provider' },
                    { header: 'address', key: 'address' },
                    { header: 'mark', key: 'mark' },
                    { header: 'country', key: 'country' },
                    { header: 'created', key: 'created' },
                    { header: 'user_creator_id', key: 'user_creator_id' },
                    { header: 'changed', key: 'changed' },
                    { header: 'user_changed_id', key: 'user_changed_id' },
                    { header: 'barcode', key: 'barcode' },
                  ]
                  selected_products.forEach((product: any) => {
                    worksheet.addRow({
                      ...product,
                      created: new Date(product.created),
                      changed: new Date(product.changed),
                      videos: product.videos?.join('; '),
                      tags: product.tags?.join('; '),
                      imgs: product.imgs?.join('; '),
                      imgs_big: product.imgs_big?.join('; '),
                      imgs_small: product.imgs_small?.join('; '),
                    })
                  })
                  saveFile('fileNameXXX', workbook)

                  console.log(worksheet)
                }}>
                excel
              </Button>
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
              <Button
                onClick={() => {
                  setBarcodesCreation(true)
                }}>
                Напечатать штрихкоды
              </Button>
              <Input.Search
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
            </div>
          }>
          <Table
            rowSelection={{
              selectedRowKeys: selected_row_keys,
              onChange: selectedRowKeys => {
                console.log('selectedRowKeys changed: ', selectedRowKeys)
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

import { Button, Card, Input, message, Select, Table } from 'antd'
import { Key, useEffect, useState } from 'react'
import {
  createProduct,
  getCategories,
  getProducts,
  products_url,
  searchProducts,
  updateProduct,
} from '../../api/api'
import axios from 'axios'
import { ColumnsType } from 'antd/lib/table'
import { ICategory } from '../categories/Categories'
import ProductsForm, { IProductFull } from './ProductsForm'
import moment from 'moment'
import Barcodes from './Barcodes'
import CSS from 'csstype'

const { Option } = Select

const full_screen_card_style: CSS.Properties = {
  position: 'fixed',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  zIndex: '100',
  display: 'grid',
  placeItems: 'center',
  backdropFilter: 'blur(4px)',
  backgroundColor: '#22222222',
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

      const res = await getProducts()
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
    },
    {
      title: 'Имя (нажмите, чтобы изменить)',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.delivery_price.localeCompare(b.delivery_price),
      render: (text, record, index) => (
        <Button
          onClick={() => {
            setEditedProductId(record._id)
            setEditedProduct(record)
          }}>
          {record.name}
        </Button>
      ),
    },
    {
      title: 'Закупочная цена',
      dataIndex: 'buy_price',
      key: 'buy_price',
      sorter: (a, b) => a.buy_price.localeCompare(b.buy_price),
    },
    {
      title: 'Цена доставки',
      dataIndex: 'delivery_price',
      key: 'delivery_price',
      sorter: (a, b) => a.delivery_price.localeCompare(b.delivery_price),
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
  ]

  return (
    <>
      {barcodes_creation && (
        <div
          style={full_screen_card_style}
          onClick={() => {
            setBarcodesCreation(false)
          }}>
          <div onClick={e => e.stopPropagation()}>
            <Barcodes
              barcodes={selected_products.map(product => ({
                barcode: product.barcode || '',
                name: product.name || '',
                article: product.article || '',
              }))}
            />
          </div>
        </div>
      )}
      <div style={{ width: '100%' }}>
        <Card
          title='Все продукты'
          extra={
            <div style={{ display: 'flex', gap: '20px' }}>
              <Button
                onClick={() => {
                  setBarcodesCreation(true)
                }}>
                Напечатать штрихкоды
              </Button>
              <Input.Search
                placeholder='поиск по имени'
                onSearch={async e => {
                  try {
                    const res = await searchProducts(e)
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
          />
        </Card>
      </div>
      {product_creation && (
        <div
          style={full_screen_card_style}
          onClick={() => {
            setProductCreation(false)
          }}>
          <div onClick={e => e.stopPropagation()}>
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
          </div>
        </div>
      )}
      {edited_product_id && (
        <div
          style={full_screen_card_style}
          onClick={() => {
            setEditedProductId('')
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsForm
              header='Изменить продукт'
              button='Изменить'
              onCancel={() => setEditedProductId('')}
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
            />
          </div>
        </div>
      )}
    </>
  )
}

export default Products

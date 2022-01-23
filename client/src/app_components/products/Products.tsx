import { Button, Card, Input, message, Select, Table } from 'antd'
import { useEffect, useState } from 'react'
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
import Search from 'antd/lib/input/Search'

const { Option } = Select

const Products = () => {
  const [products, setProducts] = useState<IProductFull[]>([])
  const [product_creation, setProductCreation] = useState<boolean>(false)
  const [categories, setCategories] = useState<string[]>([])

  const [active_products, setActiveProducts] = useState<IProductFull[]>([])
  const [active_category, setActiveCategory] = useState<string>('')

  const [edited_product_id, setEditedProductId] = useState<string>('')
  const [edited_product, setEditedProduct] = useState<IProductFull>()

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
      title: 'Image',
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
      title: 'Article',
      dataIndex: 'article',
      key: 'article',
    },
    {
      title: 'Name (click to edit)',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Buy price',
      dataIndex: 'buy_price',
      key: 'buy_price',
    },
    {
      title: 'Delivery price',
      dataIndex: 'delivery_price',
      key: 'delivery_price',
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
    },
  ]

  return (
    <>
      <div style={{ width: '100%' }}>
        <Card
          title='All products'
          extra={
            <div style={{ display: 'flex', gap: '20px' }}>
              <Input.Search
                placeholder='search by name'
                onSearch={async e => {
                  try {
                    const res = await searchProducts(e)
                    setProducts(res.data)
                  } catch (e) {
                    if (axios.isAxiosError(e)) {
                      message.error(e.response?.data)
                    }
                  }
                  console.log(e)
                }}
              />
              <Button
                style={{ backgroundColor: '#98f379' }}
                onClick={() => {
                  setProductCreation(true)
                }}>
                Create new product
              </Button>
              <Select
                placeholder='Filter by category'
                style={{ width: '200px' }}
                onChange={e => {
                  setActiveCategory(e)
                }}>
                <Option value=''>All</Option>
                {categories.map(s => (
                  <Option value={s}>{s}</Option>
                ))}
              </Select>
            </div>
          }>
          <Table dataSource={active_products} columns={columns} />
        </Card>
      </div>
      {product_creation && (
        <div
          style={{
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
          }}
          onClick={() => {
            setProductCreation(false)
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsForm
              header='Create new product'
              button='Create'
              onSubmit={async product => {
                try {
                  await createProduct(product)
                  await fetchProducts()
                  setProductCreation(false)
                  message.success('Product created')
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
          style={{
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
          }}
          onClick={() => {
            setEditedProductId('')
          }}>
          <div onClick={e => e.stopPropagation()}>
            <ProductsForm
              header='Edit product'
              button='Edit'
              onCancel={() => setEditedProductId('')}
              product={edited_product}
              onSubmit={async product => {
                try {
                  await updateProduct(product, edited_product_id)
                  await fetchProducts()
                  message.success('Product updated')
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

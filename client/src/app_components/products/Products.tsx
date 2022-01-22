import { Button, Card, message, Select, Table } from 'antd'
import { useEffect, useState } from 'react'
import {
  createProduct,
  getCategories,
  getProducts,
  products_url,
  updateProduct,
} from '../../api/api'
import axios from 'axios'
import { ColumnsType } from 'antd/lib/table'
import { ICategory } from '../categories/Categories'
import ProductsForm, { IProductFull } from './ProductsForm'

const { Option } = Select

const Products = () => {
  const [products, setProducts] = useState<IProductFull[]>([])
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
      <div style={{ display: 'flex', gap: '20px' }}>
        <ProductsForm
          header='Create new product'
          button='Create'
          onSubmit={async product => {
            try {
              await createProduct(product)
              await fetchProducts()
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
        <div style={{ width: 'fit-content' }}>
          <Card title='All products'>
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
            <Table dataSource={active_products} columns={columns} />
          </Card>
        </div>
      </div>
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
          }}>
          <ProductsForm
            header='Edit product'
            button='Edit'
            onCancel={() => {
              setEditedProductId('')
            }}
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
      )}
    </>
  )
}

export default Products

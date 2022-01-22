import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Tag,
} from 'antd'
import React, { FC, useEffect, useRef, useState } from 'react'
import { Collapse } from 'antd'
import { createProduct, getCategories } from '../../api/api'
import axios from 'axios'
import { ICategory } from '../categories/Categories'

const { Panel } = Collapse
const { Option } = Select

export interface IProduct {
  type?: string
  category?: string
  article?: string
  name: string
  description?: string
  tags?: string[]
  imgs?: FileList
  imgs_big?: string[]
  imgs_small?: string[]
  videos?: string[]
  buy_price: string
  delivery_price: string
  height: number
  length: number
  width: number
  weight: number
  brand?: string
  count?: number
  provider?: string
  address?: string
  mark?: string
  country?: string
  user_creator_id?: string
  changed?: Date
  user_changed_id?: string
}

export interface IProductFull extends IProduct {
  _id: string
}

interface Props {
  onSubmit: (product: IProduct) => any
  onCancel?: () => any
  header: string
  button: string
  product?: IProductFull
}

const ProductsForm: FC<Props> = ({
  onSubmit,
  onCancel,
  header,
  button,
  product,
}) => {
  const [tags, setTags] = useState<string[]>([])
  const [imgs, setImgs] = useState<FileList>()
  const [categories, setCategories] = useState<string[]>([])

  const input_tags_ref = useRef<Input>(null)
  const input_imgs_ref = useRef<Input>(null)

  const fetchCategories = async () => {
    const categories_res = await getCategories()
    setCategories(
      categories_res.data.map((category: ICategory) => category.name)
    )
  }
  useEffect(() => {
    fetchCategories()
  }, [])

  const onFinish = async ({
    address,
    article,
    brand,
    buy_price,
    category,
    count,
    delivery_price,
    description,
    height,
    length,
    name,
    provider,
    type,
    weight,
    width,
    mark,
    country,
    yt1,
    yt2,
    yt3,
  }: any) => {
    try {
      const videos = [yt1, yt2, yt3].filter(x => x)
      const product: IProduct = {
        type,
        category,
        article,
        name,
        description,
        tags,
        imgs,
        videos,
        buy_price,
        delivery_price,
        height,
        length,
        width,
        weight,
        brand,
        count,
        address,
        provider,
        mark,
        country,
      }
      console.log(imgs)

      onSubmit(product)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        String(err.response?.data)
          .split(',')
          .forEach(msg => message.error(msg))
      }
    }
  }

  return (
    <div style={{ width: '500px' }}>
      <Card title={header}>
        <Form name='normal_login' className='login-form' onFinish={onFinish}>
          <Collapse defaultActiveKey={['1']}>
            <Panel header='Data' key='1'>
              <Form.Item label='Type' name='type'>
                <Input defaultValue={product?.type} placeholder='Type' />
              </Form.Item>
              <Form.Item label='Category' name='category'>
                <Select defaultValue={product?.category}>
                  {categories.map(s => (
                    <Option value={s}>{s}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label='Article' name='article'>
                <Input defaultValue={product?.article} placeholder='Article' />
              </Form.Item>
            </Panel>
            <Panel header='Description' key='2'>
              <Form.Item
                label='Name'
                name='name'
                rules={[{ required: true, message: 'Please input name!' }]}>
                <Input defaultValue={product?.name} placeholder='Name' />
              </Form.Item>
              <Form.Item label='Description' name='description'>
                <Input.TextArea
                  defaultValue={product?.description}
                  placeholder='Description'
                />
              </Form.Item>
              <Form.Item label='Tags'>
                {tags.map(tag => (
                  <Tag>{tag}</Tag>
                ))}
              </Form.Item>
              <Form.Item name='tags'>
                <Input
                  defaultValue={product?.tags?.join(',')}
                  ref={input_tags_ref}
                  placeholder='Comma separated tags'
                  type='text'
                  onInput={e => {
                    const s = input_tags_ref.current?.input.value
                    if (!s) return
                    const new_tags = s
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s)
                    setTags(new_tags)
                  }}
                />
              </Form.Item>
            </Panel>
            <Panel header='Media' key='3'>
              <Form.Item label='Images' name='imgs'>
                <Input
                  type='file'
                  accept='.png, .jpg, .jpeg'
                  name='imgs'
                  multiple
                  ref={input_imgs_ref}
                  onChange={e => e.target.files && setImgs(e.target.files)}
                />
              </Form.Item>
              <Form.Item label='Youtube video 1' name='yt1'>
                <Input
                  defaultValue={product?.videos?.at(0)}
                  placeholder='Youtube video 1'
                />
              </Form.Item>
              <Form.Item label='Youtube video 2' name='yt2'>
                <Input
                  defaultValue={product?.videos?.at(1)}
                  placeholder='Youtube video 2'
                />
              </Form.Item>
              <Form.Item label='Youtube video 3' name='yt3'>
                <Input
                  defaultValue={product?.videos?.at(2)}
                  placeholder='Youtube video 3'
                />
              </Form.Item>
            </Panel>
            <Panel header='Prices' key='4'>
              <Form.Item
                label='Buy price'
                name='buy_price'
                rules={[
                  { required: true, message: 'Please input buy price!' },
                ]}>
                <InputNumber
                  defaultValue={product?.buy_price}
                  placeholder='Buy price'
                />
              </Form.Item>
              <Form.Item
                label='Delivery price'
                name='delivery_price'
                rules={[
                  { required: true, message: 'Please input delivery price!' },
                ]}>
                <InputNumber
                  defaultValue={product?.delivery_price}
                  placeholder='Delivery price'
                />
              </Form.Item>
            </Panel>
            <Panel header='Dimentions' key='5'>
              <Form.Item
                label='Height'
                name='height'
                rules={[{ required: true, message: 'Please input height!' }]}>
                <InputNumber
                  defaultValue={product?.height}
                  placeholder='Height'
                />
              </Form.Item>
              <Form.Item
                label='Length'
                name='length'
                rules={[{ required: true, message: 'Please input length!' }]}>
                <InputNumber
                  defaultValue={product?.length}
                  placeholder='Length'
                />
              </Form.Item>
              <Form.Item
                label='Width'
                name='width'
                rules={[{ required: true, message: 'Please input width!' }]}>
                <InputNumber
                  defaultValue={product?.width}
                  placeholder='Width'
                />
              </Form.Item>
              <Form.Item
                label='Weight'
                name='weight'
                rules={[{ required: true, message: 'Please input weight!' }]}>
                <InputNumber
                  addonAfter='g'
                  defaultValue={product?.weight}
                  placeholder='Weight'
                />
              </Form.Item>
            </Panel>
            <Panel header='Origins' key='6'>
              <Form.Item label='Brand' name='brand'>
                <Input defaultValue={product?.brand} placeholder='Brand' />
              </Form.Item>
              <Form.Item label='Count' name='count'>
                <InputNumber
                  defaultValue={product?.count}
                  placeholder='Count'
                />
              </Form.Item>
              <Form.Item label='Provider' name='provider'>
                <Input
                  defaultValue={product?.provider}
                  placeholder='Provider'
                />
              </Form.Item>
              <Form.Item label='Address' name='address'>
                <Input defaultValue={product?.address} placeholder='Address' />
              </Form.Item>
              <Form.Item label='Mark' name='mark'>
                <Input defaultValue={product?.mark} placeholder='Mark' />
              </Form.Item>
              <Form.Item label='Country' name='country'>
                <Input defaultValue={product?.country} placeholder='country' />
              </Form.Item>
            </Panel>
          </Collapse>
          <br />
          <Form.Item>
            <Button style={{ width: '100%' }} type='primary' htmlType='submit'>
              {button}
            </Button>
          </Form.Item>
          <Form.Item>
            {onCancel && (
              <Button style={{ width: '100%' }} onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default ProductsForm

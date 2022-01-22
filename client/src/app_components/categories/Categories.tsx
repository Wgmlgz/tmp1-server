import React, { FC, useEffect, useRef, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Alert,
  Upload,
  message,
  Tag,
  Typography,
  Table,
  Card,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
  categories_url,
  createCategory,
  getCategories,
  removeCategory,
} from '../../api/api'
import axios from 'axios'
import { ColumnsType } from 'antd/lib/table'
export interface ICategory {
  name: string
  descriptrion?: string
  img?: File
  tags?: string[]
  parent?: string
}
export interface ICategoryFull extends ICategory {
  _id: string
}

export default function Categories() {
  const [img, setImg] = useState<File>()
  const [tags, setTags] = useState<string[]>([])
  const input_tags_ref = useRef<Input>(null)
  const onFinish = async ({ name, descriptrion, parent }: ICategory) => {
    const category: ICategory = { name, descriptrion, img, tags, parent }
    console.log(category)

    try {
      const res = await createCategory(category)
      message.success('saved')
      fetchCategories()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgs = e.target.files
    if (!imgs) return
    const img = imgs[0]
    if (img) setImg(img)
  }

  const [categories, setCategories] = useState<ICategoryFull[]>([])

  const columns: ColumnsType<ICategoryFull> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descriptrion',
      dataIndex: 'descriptrion',
      key: 'descriptrion',
    },
    {
      title: 'Image',
      dataIndex: 'img',
      key: 'img',
      render: (text, record, index) =>
        record.img && (
          <img src={`${categories_url}/img/${record.img}`} alt='img' />
        ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (text, record, index) => (
        <>{record.tags && record.tags.map(tag => <Tag>{tag}</Tag>)}</>
      ),
    },
    {
      title: 'Parent category',
      dataIndex: 'parent',
      key: 'parent',
    },
    {
      title: 'Delete',
      key: 'remove',
      render: (text, record, index) => (
        <Button
          onClick={async () => {
            try {
              const res = await removeCategory(record._id)
              message.success(res.data)
              fetchCategories()
            } catch (err) {
              if (axios.isAxiosError(err)) {
                message.error(err.response?.data)
              }
            }
          }}>
          Detele
        </Button>
      ),
    },
  ]

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res.data)
      console.log(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ width: '300px' }}>
        <Card title='Create new category'>
          <Form name='normal_login' className='login-form' onFinish={onFinish}>
            <Form.Item
              name='name'
              rules={[
                {
                  required: true,
                  message: 'Please input category name!',
                },
              ]}>
              <Input placeholder='Name' />
            </Form.Item>
            <Form.Item name='descriptrion'>
              <Input placeholder='Descriptrion' />
            </Form.Item>
            <Form.Item>
              <Input
                type='file'
                accept='.png, .jpg, .jpeg'
                name='img'
                onChange={handlePhoto}
              />
            </Form.Item>
            <Form.Item>
              <label style={{ fontWeight: 'bold' }}>Tags: </label>

              {tags.map(tag => (
                <Tag>{tag}</Tag>
              ))}
            </Form.Item>
            <Form.Item name='tags'>
              <Input
                ref={input_tags_ref}
                placeholder='Comma separated tags'
                type='text'
                onInput={e => {
                  const s = input_tags_ref.current?.input.value
                  if (!s) return
                  setTags(
                    s
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s)
                  )
                }}
              />
            </Form.Item>
            <Form.Item name='parent'>
              <Input placeholder='parent' />
            </Form.Item>
            <Form.Item>
              <Button
                style={{ width: '100%' }}
                type='primary'
                htmlType='submit'>
                Create new category
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <div style={{ width: 'fit-content' }}>
        <Card title='All categories'>
          <Table dataSource={categories} columns={columns} />
        </Card>
      </div>
    </div>
  )
}

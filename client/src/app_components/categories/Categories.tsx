import React, { useEffect, useRef, useState } from 'react'
import {
  Form,
  Input,
  Button,
  message,
  Tag,
  Table,
  Card,
  Select,
  Popconfirm,
  Tree,
  Typography,
  Checkbox,
  Collapse,
} from 'antd'
import {
  categories_url,
  createCategory,
  getCategories,
  getUserColumnsSetting,
  removeCategory,
  setUserColumnsSetting,
} from '../../api/api'
import axios from 'axios'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import useColumns from '../../hooks/useColumns'

const { Option } = Select
const { Panel } = Collapse
const { Title } = Typography
export interface ICategory {
  name: string
  description?: string
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
  const [categories, setCategories] = useState<ICategoryFull[]>([])

  const input_tags_ref = useRef<Input>(null)

  const onFinish = async ({ name, description, parent }: ICategory) => {
    const category: ICategory = { name, description, img, tags, parent }

    try {
      const res = await createCategory(category)
      message.success('Сохранено')
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

  const columns = useColumns<ICategoryFull>('categories', [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Изображение',
      dataIndex: 'img',
      key: 'img',
      render: (text, record, index) =>
        record.img && (
          <img src={`${categories_url}/img/${record.img}`} alt='img' />
        ),
    },
    {
      title: 'Теги',
      dataIndex: 'tags',
      key: 'tags',
      render: (text, record, index) => (
        <>
          {record.tags &&
            record.tags.map((tag, id) => <Tag key={id}>{tag}</Tag>)}
        </>
      ),
    },
    {
      title: 'Родительская категория',
      dataIndex: 'parent',
      key: 'parent',
    },
    {
      title: 'Удалить',
      key: 'remove',
      render: (text, record, index) => (
        <Popconfirm
          title='Вы точно хотите удалить категорию?'
          onConfirm={async () => {
            try {
              const res = await removeCategory(record._id)
              message.success('Категория удалена')
              fetchCategories()
            } catch (err) {
              if (axios.isAxiosError(err)) {
                message.error(err.response?.data)
              }
            }
          }}
          okText='Да'
          cancelText='Нет'>
          <Button>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      ),
    },
  ])

  const fetchCategories = async () => {
    try {
      const res = await getCategories()
      setCategories(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  function list_to_tree(list: any[]) {
    var map: { [id: string]: any } = {},
      node,
      roots = [],
      i

    list.forEach((item, i) => {
      map[list[i].name] = i
      list[i].children = []
      list[i].key = list[i]._id
      list[i].expanded = true
    })

    for (i = 0; i < list.length; i += 1) {
      node = list[i]
      if (node.parent) {
        list[map[node.parent]].children.push(node)
      } else {
        roots.push(node)
      }
    }
    return roots
  }
  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ width: '300px' }}>
        <Card title='Создать новую категорию'>
          <Form name='normal_login' className='login-form' onFinish={onFinish}>
            <Form.Item
              name='name'
              rules={[
                {
                  required: true,
                  message: 'Пожалуйста, введите название категории!',
                },
              ]}>
              <Input placeholder='Название' />
            </Form.Item>
            <Form.Item name='description'>
              <Input placeholder='Описание' />
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
              <label style={{ fontWeight: 'bold' }}>Теги: </label>

              {tags.map((tag, id) => (
                <Tag key={id}>{tag}</Tag>
              ))}
            </Form.Item>
            <Form.Item name='tags'>
              <Input
                ref={input_tags_ref}
                placeholder='Теги, разделенные запятыми'
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
              <Select placeholder='Родительская категория'>
                {categories.map((s, id) => (
                  <Option key={id} value={s.name}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                style={{ width: '100%' }}
                type='primary'
                htmlType='submit'>
                Создать новую категорию
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
      <div style={{ flexGrow: 1 }}>
        {/* <Tree defaultExpandAll treeData={list_to_tree(categories)} /> */}
        <Card title='Все категории'>
          {categories.length ? (
            <Table
              expandable={{ defaultExpandAllRows: true }}
              dataSource={list_to_tree(categories)}
              columns={columns}
            />
          ) : (
            <Table key='loading-not-done' columns={columns} loading />
          )}
        </Card>
      </div>
    </div>
  )
}

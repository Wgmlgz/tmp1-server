import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Table,
  Tag,
} from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import { Collapse } from 'antd'
import { getCategories } from '../../api/api'
import axios from 'axios'
import { ICategory } from '../categories/Categories'
import WarehouseSelect from '../warehouses/WarehouseSelect'

const { Panel } = Collapse
const { Option } = Select

export interface IProduct {
  type?: string
  category?: string
  article?: string
  name: string
  description?: string
  color?: string
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
  provider?: string
  mark?: string
  country?: string
  created?: Date
  user_creator_id?: string
  changed?: Date
  user_changed_id?: string
  barcode?: string
  marketplace_data?: {
    [id: string]: string
  }
  addresses?: {
    [id: string]: string
  }
}

export interface IProductFull extends IProduct {
  _id: string
}

interface Props {
  onSubmit: (product: IProduct) => any
  onCancel?: () => any
  onRemove?: () => any
  header: string
  button: string
  product?: IProductFull
}

const ProductsForm: FC<Props> = ({
  onSubmit,
  onCancel,
  onRemove,
  header,
  button,
  product,
}) => {
  const [tags, setTags] = useState<string[]>([])
  const [imgs, setImgs] = useState<FileList>()
  const [categories, setCategories] = useState<string[]>([])
  const [marketplace_data, setMarketplaceData] = useState<[string, string][]>(
    []
  )
  const [addresses, setAddresses] = useState<any>({})
  const [warehouse, setWarehouse] = useState<string>()
  const [address, setAddress] = useState<string>('aboba')

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

  useEffect(() => {
    warehouse && setAddress(addresses[warehouse])
  }, [warehouse])
  useEffect(() => {
    setAddresses({ ...product?.addresses })

    setMarketplaceData([
      ...Object.entries({
        'Номенклатура Wildberries FBS': '',
        'Штрихкод Wildberries FBS': '',
        'Номенклатура Wildberries FBW': '',
        'Штрихкод Wildberries FBW': '',
        'Номенклатура Yandex FBS': '',
        'Штрихкод Yandex FBS': '',
        'Номенклатура Yandex FBY': '',
        'Штрихкод Yandex FBY': '',
        'Номенклатура Ozon FBS': '',
        'Штрихкод Ozon FBS': '',
        'Номенклатура Ozon FBO': '',
        'Штрихкод Ozon FBO': '',
        'Номенклатура Sber FBS': '',
        'Штрихкод Sber FBS': '',
        'Номенклатура AliExpress FBS': '',
        'Штрихкод AliExpress FBS': '',
        'Номенклатура KazanExpress FBK': '',
        'Штрихкод KazanExpress FBK': '',
        ...(product?.marketplace_data ?? {}),
      }),
    ])
  }, [product])

  const onFinish = async ({
    article,
    brand,
    buy_price,
    category,
    delivery_price,
    description,
    color,
    height,
    length,
    name,
    provider,
    type,
    weight,
    width,
    mark,
    country,
    barcode,
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
        color,
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
        provider,
        mark,
        country,
        barcode,
        marketplace_data: Object.fromEntries(marketplace_data),
        addresses,
      }

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
    <div>
      <Card title={header}>
        <Form
          name='normal_login'
          className='login-form'
          onFinish={onFinish}
          initialValues={{
            article: product?.article,
            name: product?.name,
            buy_price: product?.buy_price,
            delivery_price: product?.delivery_price,
            width: product?.width,
            height: product?.height,
            length: product?.length,
            weight: product?.weight,
          }}>
          <div
            style={{
              height: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                flexGrow: 1,
                overflowY: 'auto',
              }}>
              <Collapse defaultActiveKey={['1']} style={{ width: '500px' }}>
                <Panel header='Информация' key='1'>
                  <Form.Item label='Тип' name='type'>
                    <Input defaultValue={product?.type} placeholder='Тип' />
                  </Form.Item>
                  <Form.Item label='Категория' name='category'>
                    <Select
                      defaultValue={product?.category}
                      placeholder='Категория'>
                      {categories.map(s => (
                        <Option value={s}>{s}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label='Артикул' name='article'>
                    <Input
                      defaultValue={product?.article}
                      placeholder='Артикул'
                    />
                  </Form.Item>
                  <Form.Item label='Штрихкод' name='barcode'>
                    <Input
                      defaultValue={product?.barcode}
                      placeholder='Штрихкод'
                    />
                  </Form.Item>
                  <WarehouseSelect
                    required={false}
                    label='Склад'
                    name='__warehouse__'
                    onChange={s => {
                      setWarehouse(s)
                    }}
                  />
                  <Form.Item label='Адрес'>
                    <Input
                      value={address}
                      placeholder='Адрес'
                      onChange={e => {
                        if (warehouse)
                          setAddresses({
                            ...addresses,
                            [warehouse]: e.target.value,
                          })
                        setAddress(e.target.value)
                      }}
                      disabled={!warehouse}
                    />
                  </Form.Item>
                </Panel>
                <Panel header='Маркетплейсы' key='7'>
                  <Table
                    columns={[
                      {
                        title: 'Маркетплейс',
                        dataIndex: 'marketplace',
                        key: 'marketplace',
                        render: (text, record, index) => <p>{record[0]}</p>,
                      },
                      {
                        title: 'Штрихкоды',
                        dataIndex: 'barcode',
                        key: 'barcode',
                        render: (text, record, index) => (
                          <Input
                            defaultValue={record[1]}
                            onChange={e => {
                              const s = e.target.value
                              const new_data = [...marketplace_data]
                              new_data[index][1] = s
                              setMarketplaceData(new_data)
                            }}
                          />
                        ),
                      },
                    ]}
                    pagination={{ defaultPageSize: 10000 }}
                    dataSource={marketplace_data}
                  />
                </Panel>
                <Panel header='Описание' key='2'>
                  <Form.Item
                    label='Название'
                    name='name'
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, введите Название!',
                      },
                    ]}>
                    <Input
                      defaultValue={product?.name}
                      placeholder='Название'
                    />
                  </Form.Item>
                  <Form.Item label='Описание' name='description'>
                    <Input.TextArea
                      defaultValue={product?.description}
                      placeholder='Описание'
                    />
                  </Form.Item>
                  <Form.Item label='Цвет' name='color'>
                    <Input.TextArea
                      defaultValue={product?.color}
                      placeholder='цвет'
                    />
                  </Form.Item>
                  <Form.Item label='Теги'>
                    {tags.map(tag => (
                      <Tag>{tag}</Tag>
                    ))}
                  </Form.Item>
                  <Form.Item name='tags'>
                    <Input
                      defaultValue={product?.tags?.join(',')}
                      ref={input_tags_ref}
                      placeholder='Теги, разделенные запятыми'
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
                <Panel header='Медиа' key='3'>
                  <Form.Item label='Изображения' name='imgs'>
                    <Input
                      type='file'
                      accept='.png, .jpg, .jpeg'
                      name='imgs'
                      multiple
                      ref={input_imgs_ref}
                      onChange={e => e.target.files && setImgs(e.target.files)}
                    />
                  </Form.Item>
                  <Form.Item label='Видео на Youtube 1' name='yt1'>
                    <Input
                      defaultValue={product?.videos?.at(0)}
                      placeholder='Видео на Youtube 1'
                    />
                  </Form.Item>
                  <Form.Item label='Видео на Youtube 2' name='yt2'>
                    <Input
                      defaultValue={product?.videos?.at(1)}
                      placeholder='Видео на Youtube 2'
                    />
                  </Form.Item>
                  <Form.Item label='Видео на Youtube 3' name='yt3'>
                    <Input
                      defaultValue={product?.videos?.at(2)}
                      placeholder='Видео на Youtube 3'
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
              <Collapse defaultActiveKey={['1']} style={{ width: '500px' }}>
                <Panel header='Цены' key='4'>
                  <Form.Item
                    label='Закупочная цена'
                    name='buy_price'
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, введите закупочную цену!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={Number(product?.buy_price)}
                      placeholder='Закупочная цена'
                    />
                  </Form.Item>
                  <Form.Item
                    label='Цена доставки'
                    name='delivery_price'
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, введите цену доставки!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={Number(product?.delivery_price)}
                      placeholder='Цена доставки'
                    />
                  </Form.Item>
                </Panel>
                <Panel header='Размеры' key='5'>
                  <Form.Item
                    label='Высота'
                    name='height'
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, введите высоту!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={product?.height}
                      placeholder='Высота'
                    />
                  </Form.Item>
                  <Form.Item
                    label='Длина'
                    name='length'
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, введите длинну!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={product?.length}
                      placeholder='Длина'
                    />
                  </Form.Item>
                  <Form.Item
                    label='Ширина'
                    name='width'
                    rules={[
                      {
                        required: true,
                        message: 'Пожалуйста, введите ширина!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={product?.width}
                      placeholder='Ширина'
                    />
                  </Form.Item>
                  <Form.Item
                    label='Вес'
                    name='weight'
                    rules={[
                      { required: true, message: 'Пожалуйста, введите вес!' },
                    ]}>
                    <InputNumber
                      min={0}
                      addonAfter='g'
                      defaultValue={product?.weight}
                      placeholder='Вес'
                    />
                  </Form.Item>
                </Panel>
                <Panel header='Происхождение' key='6'>
                  <Form.Item label='Бренд' name='brand'>
                    <Input defaultValue={product?.brand} placeholder='Бренд' />
                  </Form.Item>
                  <Form.Item label='Поставщик' name='provider'>
                    <Input
                      defaultValue={product?.provider}
                      placeholder='Поставщик'
                    />
                  </Form.Item>
                  <Form.Item label='Заметка' name='mark'>
                    <Input defaultValue={product?.mark} placeholder='Заметка' />
                  </Form.Item>
                  <Form.Item label='Страна' name='country'>
                    <Input
                      defaultValue={product?.country}
                      placeholder='Страна'
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
            </div>

            <br />
            <div style={{ display: 'flex', width: '100%', gap: '20px' }}>
              <Form.Item style={{ flexGrow: 1 }}>
                <Button
                  style={{ width: '100%' }}
                  type='primary'
                  htmlType='submit'>
                  {button}
                </Button>
              </Form.Item>
              {onRemove && (
                <Form.Item style={{ flexGrow: 1 }}>
                  <Popconfirm
                    onCancel={() => {}}
                    onConfirm={onRemove}
                    title={`Вы точно хотите безвозвратно удалить продукт?`}
                    okText='Да'
                    cancelText='Нет'>
                    <Button
                      style={{
                        flexGrow: 1,
                        backgroundColor: '#ff5555',
                        width: '100%',
                      }}>
                      Удалить
                    </Button>
                  </Popconfirm>
                </Form.Item>
              )}
              {onCancel && (
                <Form.Item style={{ flexGrow: 1 }}>
                  <Button style={{ width: '100%' }} onClick={onCancel}>
                    Отмена
                  </Button>
                </Form.Item>
              )}
            </div>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default ProductsForm

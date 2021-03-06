import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tag,
  Upload,
} from 'antd'
import { FC, useEffect, useRef, useState } from 'react'
import { Collapse } from 'antd'
import { getCategories, products_url } from '../../api/api'
import axios from 'axios'
import { ICategory } from '../categories/Categories'
import WarehouseSelect from '../warehouses/WarehouseSelect'
import { PlusOutlined } from '@ant-design/icons'

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
  update_price: boolean
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
  const [fileState, setFileState] = useState<any>({
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [],
  })
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
        '???????????????????????? Wildberries FBS': '',
        '???????????????? Wildberries FBS': '',
        '???????????????????????? Wildberries FBW': '',
        '???????????????? Wildberries FBW': '',
        '???????????????????????? Yandex FBS': '',
        '???????????????? Yandex FBS': '',
        '???????????????????????? Yandex FBY': '',
        '???????????????? Yandex FBY': '',
        '???????????????????????? Ozon FBS': '',
        '???????????????? Ozon FBS': '',
        '???????????????????????? Ozon FBO': '',
        '???????????????? Ozon FBO': '',
        '???????????????????????? Sber FBS': '',
        '???????????????? Sber FBS': '',
        '???????????????????????? AliExpress FBS': '',
        '???????????????? AliExpress FBS': '',
        '???????????????????????? KazanExpress FBK': '',
        '???????????????? KazanExpress FBK': '',
        ...(product?.marketplace_data ?? {}),
      }),
    ])
  }, [product])

  const onFinish = async (e: any) => {
    const {
      article,
      brand,
      buy_price,
      category,
      delivery_price,
      update_price,
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
    } = e
    console.log(e)

    console.log(update_price)

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
        imgs: fileState.fileList.map((file: any) => file.originFileObj),
        videos,
        buy_price,
        delivery_price,
        update_price,
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

  useEffect(() => {
    const setup = async () => {
      const files = await Promise.all(
        product?.imgs_big?.map(async (img, id) => ({
          uid: `-${id}`,
          name: 'image.png',
          status: 'done',
          url: `${products_url}/img/${img}`,
          originFileObj: new File(
            [
              (
                await axios.get(`${products_url}/img/${img}`, {
                  responseType: 'blob',
                })
              ).data,
            ],
            'name.jpg'
          ),
        })) ?? []
      )
      setFileState((x: any) => ({
        ...x,
        fileList: [...x.fileList, ...files],
      }))
    }
    setup()
  }, [])
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
            update_price: product?.update_price,
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
                <Panel header='????????????????????' key='1'>
                  <Form.Item label='??????' name='type'>
                    <Input defaultValue={product?.type} placeholder='??????' />
                  </Form.Item>
                  <Form.Item label='??????????????????' name='category'>
                    <Select
                      defaultValue={product?.category}
                      placeholder='??????????????????'>
                      {categories.map((s, id) => (
                        <Option key={id} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label='??????????????' name='article'>
                    <Input
                      defaultValue={product?.article}
                      placeholder='??????????????'
                    />
                  </Form.Item>
                  <Form.Item label='????????????????' name='barcode'>
                    <Input
                      defaultValue={product?.barcode}
                      placeholder='????????????????'
                    />
                  </Form.Item>
                  <WarehouseSelect
                    required={false}
                    label='??????????'
                    name='__warehouse__'
                    onChange={s => {
                      setWarehouse(s)
                    }}
                  />
                  <Form.Item label='??????????'>
                    <Input
                      value={address}
                      placeholder='??????????'
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
                <Panel header='????????????????????????' key='7'>
                  <Table
                    columns={[
                      {
                        title: '??????????????????????',
                        dataIndex: 'marketplace',
                        key: 'marketplace',
                        render: (text, record, index) => <p>{record[0]}</p>,
                      },
                      {
                        title: '??????????????????',
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
                    dataSource={marketplace_data?.map((x, i) => ({
                      ...x,
                      key: i,
                    }))}
                  />
                </Panel>
                <Panel header='????????????????' key='2'>
                  <Form.Item
                    label='????????????????'
                    name='name'
                    rules={[
                      {
                        required: true,
                        message: '????????????????????, ?????????????? ????????????????!',
                      },
                    ]}>
                    <Input
                      defaultValue={product?.name}
                      placeholder='????????????????'
                    />
                  </Form.Item>
                  <Form.Item label='????????????????' name='description'>
                    <Input.TextArea
                      defaultValue={product?.description}
                      placeholder='????????????????'
                    />
                  </Form.Item>
                  <Form.Item label='????????' name='color'>
                    <Input.TextArea
                      defaultValue={product?.color}
                      placeholder='????????'
                    />
                  </Form.Item>
                  <Form.Item label='????????'>
                    {tags.map((tag, id) => (
                      <Tag key={id}>{tag}</Tag>
                    ))}
                  </Form.Item>
                  <Form.Item name='tags'>
                    <Input
                      defaultValue={product?.tags?.join(',')}
                      ref={input_tags_ref}
                      placeholder='????????, ?????????????????????? ????????????????'
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
                <Panel header='??????????' key='3'>
                  <Form.Item label='??????????????????????' name='imgs'>
                    <Upload
                      listType='picture-card'
                      fileList={fileState.fileList}
                      onRemove={file => {
                        setFileState((state: any) => {
                          const index = state.fileList.indexOf(file)
                          const newFileList = state.fileList.slice()
                          newFileList.splice(index, 1)
                          return {
                            ...state,
                            fileList: newFileList,
                          }
                        })
                      }}
                      beforeUpload={file => {
                        setFileState((state: any) => ({
                          ...state,
                          fileList: [...state.fileList, file],
                        }))
                        return false
                      }}
                      onPreview={async (file: any) => {
                        const getBase64 = (file: any) =>
                          new Promise((resolve, reject) => {
                            const reader = new FileReader()
                            reader.readAsDataURL(file)
                            reader.onload = () => resolve(reader.result)
                            reader.onerror = error => reject(error)
                          })

                        if (!file.url && !file.preview) {
                          file.preview = await getBase64(file.originFileObj)
                        }

                        setFileState((x: any) => ({
                          ...x,
                          previewImage: file.url || file.preview,
                          previewVisible: true,
                          previewTitle:
                            file.name ||
                            file.url.substring(file.url.lastIndexOf('/') + 1),
                        }))
                      }}
                      onChange={({ fileList }) =>
                        setFileState((x: any) => ({ ...x, fileList }))
                      }>
                      {fileState.fileList.length >= 8 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                  <Modal
                    visible={fileState.previewVisible}
                    title={fileState.previewTitle}
                    footer={null}
                    onCancel={() =>
                      setFileState((x: any) => ({
                        ...x,
                        previewVisible: false,
                      }))
                    }>
                    <img
                      alt='example'
                      style={{ width: '100%' }}
                      src={fileState.previewImage}
                    />
                  </Modal>
                  <Form.Item label='?????????? ???? Youtube 1' name='yt1'>
                    <Input
                      defaultValue={product?.videos?.at(0)}
                      placeholder='?????????? ???? Youtube 1'
                    />
                  </Form.Item>
                  <Form.Item label='?????????? ???? Youtube 2' name='yt2'>
                    <Input
                      defaultValue={product?.videos?.at(1)}
                      placeholder='?????????? ???? Youtube 2'
                    />
                  </Form.Item>
                  <Form.Item label='?????????? ???? Youtube 3' name='yt3'>
                    <Input
                      defaultValue={product?.videos?.at(2)}
                      placeholder='?????????? ???? Youtube 3'
                    />
                  </Form.Item>
                </Panel>
              </Collapse>
              <Collapse defaultActiveKey={['1']} style={{ width: '500px' }}>
                <Panel header='????????' key='4'>
                  <Form.Item
                    label='???????????????????? ????????'
                    name='buy_price'
                    rules={[
                      {
                        required: true,
                        message: '????????????????????, ?????????????? ???????????????????? ????????!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={Number(product?.buy_price)}
                      placeholder='???????????????????? ????????'
                    />
                  </Form.Item>
                  <Form.Item
                    label='???????? ????????????????'
                    name='delivery_price'
                    rules={[
                      {
                        required: true,
                        message: '????????????????????, ?????????????? ???????? ????????????????!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={Number(product?.delivery_price)}
                      placeholder='???????? ????????????????'
                    />
                  </Form.Item>
                  <Form.Item
                    label='?????????????????? ???????????????????????????? ???????????? ?????? ???? ??????????????????????????'
                    name='update_price'
                    valuePropName='checked'>
                    <Checkbox defaultChecked={product?.update_price ?? true} />
                  </Form.Item>
                </Panel>
                <Panel header='??????????????' key='5'>
                  <Form.Item
                    label='????????????'
                    name='height'
                    rules={[
                      {
                        required: true,
                        message: '????????????????????, ?????????????? ????????????!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={product?.height}
                      placeholder='????????????'
                    />
                  </Form.Item>
                  <Form.Item
                    label='??????????'
                    name='length'
                    rules={[
                      {
                        required: true,
                        message: '????????????????????, ?????????????? ????????????!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={product?.length}
                      placeholder='??????????'
                    />
                  </Form.Item>
                  <Form.Item
                    label='????????????'
                    name='width'
                    rules={[
                      {
                        required: true,
                        message: '????????????????????, ?????????????? ????????????!',
                      },
                    ]}>
                    <InputNumber
                      min={0}
                      defaultValue={product?.width}
                      placeholder='????????????'
                    />
                  </Form.Item>
                  <Form.Item
                    label='??????'
                    name='weight'
                    rules={[
                      { required: true, message: '????????????????????, ?????????????? ??????!' },
                    ]}>
                    <InputNumber
                      min={0}
                      addonAfter='g'
                      defaultValue={product?.weight}
                      placeholder='??????'
                    />
                  </Form.Item>
                </Panel>
                <Panel header='??????????????????????????' key='6'>
                  <Form.Item label='??????????' name='brand'>
                    <Input defaultValue={product?.brand} placeholder='??????????' />
                  </Form.Item>
                  <Form.Item label='??????????????????' name='provider'>
                    <Input
                      defaultValue={product?.provider}
                      placeholder='??????????????????'
                    />
                  </Form.Item>
                  <Form.Item label='??????????????' name='mark'>
                    <Input defaultValue={product?.mark} placeholder='??????????????' />
                  </Form.Item>
                  <Form.Item label='????????????' name='country'>
                    <Input
                      defaultValue={product?.country}
                      placeholder='????????????'
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
                    title={`???? ?????????? ???????????? ???????????????????????? ?????????????? ???????????`}
                    okText='????'
                    cancelText='??????'>
                    <Button
                      style={{
                        flexGrow: 1,
                        backgroundColor: '#ff5555',
                        width: '100%',
                      }}>
                      ??????????????
                    </Button>
                  </Popconfirm>
                </Form.Item>
              )}
              {onCancel && (
                <Form.Item style={{ flexGrow: 1 }}>
                  <Button style={{ width: '100%' }} onClick={onCancel}>
                    ????????????
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

import { Button, Card, message, Popconfirm, Popover } from 'antd'
import Table, { ColumnsType } from 'antd/lib/table'
import { useEffect, useState } from 'react'
import {
  IProductMove,
  IProductMoveFull,
  ProductsMoveForm,
} from './ProductsMoveForm'

import {
  PlusCircleOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import {
  createProductMove,
  getProductsMove,
  removeProductMove,
  updateProductMove,
} from '../../api/api'
import axios from 'axios'
import { IWarehouseFull } from './WarehouseForm'
import { getWarehouses } from '../../api/api'
import { IProductFull } from '../products/ProductsForm'
import moment from 'moment'
import FullscreenCard from '../FullscreenCard'

export default function ProductsMove() {
  const [products_move, setProductsMove] = useState<IProductMoveFull[]>([])
  const [product_move_cteation, setProductMoveCreation] =
    useState<boolean>(false)

  const [warehouses_map, setWarehousesMap] = useState(new Map<string, string>())

  const [edited_product_move_id, setEditedProductMoveId] = useState<string>('')
  const [edited_product_move, setEditedProductMove] =
    useState<IProductMoveFull>()

  const fetchProductsMove = async () => {
    try {
      const res = await getProductsMove()
      setProductsMove(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      }
    }
  }

  useEffect(() => {
    fetchProductsMove()
    const setup = async () => {
      try {
        const res_warehouses = await getWarehouses()

        setWarehousesMap(
          new Map<string, string>(
            res_warehouses.data.map((warehouse: IWarehouseFull) => [
              warehouse._id,
              warehouse.name,
            ])
          )
        )
      } catch (err) {
        if (axios.isAxiosError(err)) {
          message.error(err.response?.data)
        }
      }
    }
    setup()
  }, [])
  const columns: ColumnsType<IProductMoveFull> = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: (text, record, index) => moment(record.date).format('DD-MM-YYYY'),
    },
    {
      title: 'Склад отправления',
      dataIndex: 'warehouse_from',
      key: 'warehouse_from',
      render: (text, record, index) =>
        warehouses_map.get(record.warehouse_from),
    },
    {
      title: 'Склад прибытия',
      dataIndex: 'warehouse_to',
      key: 'warehouse_to',
      render: (text, record, index) => warehouses_map.get(record.warehouse_to),
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      key: 'comment',
    },
    {
      title: 'Товары',
      dataIndex: 'products',
      key: 'products',
      render: (text, record, index) => (
        <p style={{ whiteSpace: 'pre' }}>
          {record.products
            .map(product => `${product.name}  ${product.quantity}`)
            .join('\n')}
        </p>
      ),
    },
    {
      title: 'Подробнее',
      key: 'remove',
      render: (text, record, index) => (
        <Popover
          placement='left'
          content={
            <ProductsMoveForm
              onCancel={() => setProductMoveCreation(false)}
              header='Перемещение'
              button='Создать новое списание'
              product_move={record}
            />
          }>
          <Button>Подробнее</Button>,
        </Popover>
      ),
    },
    // {
    //   title: '',
    //   key: 'remove',
    //   render: (text, record, index) => (
    //     <div style={{ display: 'flex', gap: '10px' }}>
    //       <Popconfirm
    //         title='Вы точно хотите удалить перемещение?'
    //         onConfirm={async () => {
    //           try {
    //             const res = await removeProductMove(record._id)
    //             message.success(res.data)
    //             fetchProductsMove()
    //           } catch (err) {
    //             if (axios.isAxiosError(err)) {
    //               message.error(err.response?.data)
    //             }
    //           }
    //         }}
    //         okText='Да'
    //         cancelText='Нет'>
    //         <Button>
    //           <DeleteOutlined />
    //         </Button>
    //       </Popconfirm>
    //       <Button
    //         onClick={() => {
    //           setEditedProductMoveId(record._id)
    //           setEditedProductMove(record)
    //         }}>
    //         <EditOutlined />
    //       </Button>
    //     </div>
    //   ),
    // },
  ]
  return (
    <>
      {product_move_cteation && (
        <FullscreenCard onCancel={() => setProductMoveCreation(false)}>
          <ProductsMoveForm
            onCancel={() => setProductMoveCreation(false)}
            onSubmit={async (data: IProductMove) => {
              try {
                const res = await createProductMove(data)
                await fetchProductsMove()
                message.success(res.data)
                setProductMoveCreation(false)
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}
            header='Новое перемещение'
            button='Создать новое перемещение'
          />
        </FullscreenCard>
      )}
      {edited_product_move_id && (
        <FullscreenCard onCancel={() => setEditedProductMoveId('')}>
          <ProductsMoveForm
            product_move={edited_product_move}
            onCancel={() => setEditedProductMoveId('')}
            onSubmit={async (data: IProductMove) => {
              try {
                const res = await updateProductMove(
                  edited_product_move_id,
                  data
                )
                await fetchProductsMove()
                message.success(res.data)
                setEditedProductMoveId('')
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}
            header='Обновить перемещение'
            button='Обновить перемещение'
          />
        </FullscreenCard>
      )}
      <Card
        title='Перемещения'
        extra={
          <Button
            type='primary'
            onClick={() => {
              setProductMoveCreation(true)
            }}>
            <PlusCircleOutlined /> перемещение
          </Button>
        }>
        <Table
          dataSource={products_move?.map((x, i) => ({ ...x, key: i }))}
          columns={columns}
        />
      </Card>
    </>
  )
}

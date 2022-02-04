import { Button, message, Popover, Progress, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import axios from 'axios'
import ExcelJS from 'exceljs'
import moment from 'moment'
import { FC, useEffect, useRef, useState } from 'react'
import { createExcelProducts, getExcelImports } from '../../api/api'

interface IImport {
  date: Date
  import_errors: string[]
  done: string[]
  total: number
  failed: number
}

export const importProducts = (e: any, onDone: (products: any) => any) => {
  const files = e.target.files
  if (!files) return
  const file = files[0]

  const wb = new ExcelJS.Workbook()
  const reader = new FileReader()

  reader.readAsArrayBuffer(file)
  reader.onload = async () => {
    try {
      const buffer = reader.result
      const workbook = await wb.xlsx.load(buffer as any)
      console.log(workbook, 'workbook instance')
      workbook.eachSheet((sheet, id) => {
        const products: any[] = []
        sheet.eachRow((row, id) => {
          try {
            if (id === 1) return
            let product: any = {}
            for (let j = 1; j <= sheet.columnCount; j++) {
              // @ts-ignore
              const header: any = sheet.getRow(1).values[j]
              // @ts-ignore
              const value =
                // @ts-ignore
                row.values[j] && (row.values[j].text ?? row.values[j])

              product[header] = value
            }
            product.tags = product.tags
              .split(';')
              .map((str: string) => str.trim())
              .filter((x: string) => !!x)
            console.log(product.imgs)

            product.upload_imgs = product.imgs
              .split(';')
              .map((str: string) => str.trim())
              .filter((x: string) => !!x)
            delete product.imgs_big
            delete product.imgs
            delete product.imgs_small
            product.excel_row = id
            products.push(product)
          } catch (err) {
            message.error(err as any)
          }
        })
        onDone(products)
      })
    } catch (err) {
      message.error(err as any)
    }
  }
}

const Page: FC = () => {
  const hiddenFileInput = useRef(null)

  const [da, setDa] = useState<any>()
  const [imports, setImports] = useState<IImport[]>([])

  const columns: ColumnsType<IImport> = [
    {
      title: 'Дата и время',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      render: (text, record, index) =>
        moment(record.date).format('DD-MM-GGGG hh:mm:ss'),
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
    },
    {
      title: 'Успешно/Неуспешно/Всего',
      dataIndex: 'date',
      key: 'date',
      defaultSortOrder: 'descend',
      render: (text, record, index) => (
        <p
          style={{
            textAlign: 'center',
          }}>
          <span
            style={{
              fontWeight: 'bold',
              color: 'lightgreen',
              textAlign: 'center',
            }}>
            {record.done.length}
          </span>
          {'/'}
          <span
            style={{
              fontWeight: 'bold',
              color: '#ff5555',
              textAlign: 'center',
            }}>
            {record.failed}
          </span>
          {'/'}
          <span
            style={{
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            {record.total}
          </span>
        </p>
      ),
    },
    {
      title: 'Ошибки',
      dataIndex: 'import_errors',
      key: 'import_errors',
      render: (text, record, index) => (
        <Popover
          content={
            <Table
              columns={[
                {
                  title: 'Ошибки',
                  dataIndex: 'err',
                  key: 'err',
                },
              ]}
              dataSource={record.import_errors.map(str => ({ err: str }))}
            />
          }>
          <Button type='primary' style={{ backgroundColor: '#ff5555' }}>
            {record.import_errors.length}
          </Button>
        </Popover>
      ),
    },
    {
      title: 'Прогресс',
      key: 'progress',
      render: (text, record, index) => (
        <Progress
          percent={((record.done.length + record.failed) / record.total) * 100}
          success={{ percent: (record.done.length / record.total) * 100 }}
          status='exception'
          size='small'
        />
      ),
    },
  ]

  const fetchImports = async () => {
    try {
      const res = await getExcelImports()
      setImports(res.data)
      console.log(imports)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.response?.data)
      } else {
        message.error(err as any)
      }
    }
  }
  useEffect(() => {
    fetchImports()
    setInterval(() => fetchImports(), 1000)
  }, [])
  return (
    <div>
      <input
        ref={hiddenFileInput}
        type='file'
        name='file'
        onInput={e =>
          importProducts(e, async products => {
            try {
              setDa(products)
              await createExcelProducts(products)
              await fetchImports()
              message.success('Импорт продуктов начен')
            } catch (err) {
              if (axios.isAxiosError(err)) {
                message.error(err.response?.data)
              } else {
                message.error(err as any)
              }
            }
          })
        }
        style={{ display: 'none' }}
      />
      <Button
        onClick={event => {
          // @ts-ignore
          hiddenFileInput.current.click()
        }}>
        Импорт excel
      </Button>
      <Table dataSource={imports} columns={columns} />
      <pre>{JSON.stringify(da, null, 2)}</pre>
    </div>
  )
}
export default Page

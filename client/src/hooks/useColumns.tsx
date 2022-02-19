import { Checkbox, Collapse } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { getUserColumnsSetting, setUserColumnsSetting } from '../api/api'

const { Panel } = Collapse

export default function useColumns<T>(
  save_id: string,
  columns: (ColumnType<T> & { key: string })[],
  deps?: any[]
): ColumnsType<T> {
  const [res, setRes] = useState<ColumnsType<T>>([])
  const [fetched, setFetched] = useState(false)
  const [visible, setVisible] = useState(
    new Map<string, boolean>(columns.map(column => [column.key, true]))
  )

  const genCols = () => [
    ...[...columns].filter(column => visible.get(column.key)),
    {
      key: 'edit_columns',
      title: (
        <Collapse>
          <Panel key='columns' header='Столбцы'>
            {columns.map((column, id) => (
              <div key={id}>
                <Checkbox
                  checked={!!visible.get(column.key)}
                  onChange={e => {
                    const old = new Map(visible)
                    old.set(column.key, e.target.checked)
                    setVisible(old)
                  }}>
                  {column.title}
                </Checkbox>
              </div>
            ))}
          </Panel>
        </Collapse>
      ),
    },
  ]

  useEffect(() => {
    const setup = async () => {
      try {
        setRes(genCols())
        if (fetched)
          await setUserColumnsSetting(save_id, Object.fromEntries(visible))
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.log(err)
        }
      }
    }
    setup()
  }, [visible])

  useEffect(() => {
    const setup = async () => {
      try {
        const res = await getUserColumnsSetting(save_id)
        if (Object.entries(res.data).length) {
          const settings = new Map<string, boolean>(Object.entries(res.data))
          setVisible(settings)
        }

        setFetched(true)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.log(err)
        }
      }
    }
    setup()
  }, [fetched])

  useEffect(() => {
    setRes(genCols())
  }, deps ?? [])

  return res
}

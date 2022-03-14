import { Button, Card, message, Popover, Progress, Table } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { FC, useEffect, useRef, useState } from 'react'
import { getBackup, restoreBackup } from '../api/api'
import downloadJson from '../downloadJson'

const Page: FC = () => {
  const [files, setFiles] = useState<any>()

  return (
    <div>
      <Card>
        <h1>Создание бекапа</h1>
        <div>
          <Button
            type='primary'
            onClick={async () => {
              try {
                const data = (await getBackup()).data
                downloadJson(
                  data,
                  `backup-${moment().format('DD-DD-YYYY-HH-mm')}.json`
                )
              } catch (err) {
                if (axios.isAxiosError(err)) {
                  message.error(err.response?.data)
                }
              }
            }}>
            Сделать бекап
          </Button>
        </div>
        <br />
        <br />

        <h1>Восстановление бекапа</h1>
        <div>
          <label>Загрузить файл (.json) </label>
          <input
            type='file'
            onChange={(e: any) => {
              const fileReader = new FileReader()
              fileReader.readAsText(e.target.files[0], 'UTF-8')
              fileReader.onload = (e: any) => {
                setFiles(JSON.parse(e.target.result))
              }
            }}
          />
        </div>
        <br />
        <Button
          type='primary'
          onClick={async () => {
            try {
              await restoreBackup(files)
              message.success('Восстанвление началось')
            } catch (err) {
              if (axios.isAxiosError(err)) {
                message.error(err.response?.data)
              }
            }
          }}>
          Восстановить из бекап-файла
        </Button>
      </Card>
    </div>
  )
}
export default Page

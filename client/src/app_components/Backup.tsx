import { Button, Card, message, Popover, Progress, Table } from 'antd'
import axios from 'axios'
import moment from 'moment'
import { FC, useEffect, useRef, useState } from 'react'
import { getBackup } from '../api/api'

const Page: FC = () => {

  return (
    <div>
      <Card>
        <Button type='primary' onClick={async () => {
          try {
            const data = (await getBackup()).data
            const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
              JSON.stringify(data)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `backup-${moment().format('DD-DD-YYYY-HH-mm')}.json`;

            link.click();
          } catch (err) {
            if (axios.isAxiosError(err)) {
              message.error(err.response?.data)
            }
          }
        }}>Сделать бекап</Button>
        <Button type='primary' onClick={async () => {
          try {

          } catch (err) {
            if (axios.isAxiosError(err)) {
              message.error(err.response?.data)
            }
          }
        }}>Восстановить из бекап-файла</Button>
      </Card>
    </div>
  )
}
export default Page

import { Button, Card, DatePicker, Form, message, Space } from 'antd'
import axios from 'axios'
import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { getWildBerriesAnalytics } from '../../api/api'
const { RangePicker } = DatePicker

export const Analytics = () => {
  const [stats, setStats] = useState<{
    orders: number
    sum: number
    last: string[]
  }>()

  const fetchStats = async (start: Moment, end: Moment) => {
    setStats(undefined)
    try {
      const new_stats = await getWildBerriesAnalytics(
        start.toDate(),
        end.toDate()
      )
      setStats(new_stats.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        message.error(err.message)
      }
    }
  }

  useEffect(() => {
    fetchStats(moment(), moment())
  }, [])

  return (
    <Card title='Аналитика'>
      <RangePicker
        onChange={e => {
          console.log(e)
          fetchStats(e?.[0] ?? moment(), e?.[1] ?? moment())
        }}
      />
      <br />
      <br />
      {stats ? (
        <div>
          <h1>Заказов:</h1>
          <p>{stats.orders}</p>
          <h1>Сумма: </h1>
          <p>{stats.sum}</p>
          <h1>За последние 30 дней:</h1>
          {stats.last.map(x => (
            <p key={x}>{x}</p>
          ))}
        </div>
      ) : (
        <p>загрузка...</p>
      )}
    </Card>
  )
}

import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { getUser } from '../api/api'

export default function User() {
  const [user, setUser] = useState('')

  const setup = useCallback(async () => {
    try {
      setUser('loading...')
      const res = await getUser()
      console.log(res)
      setUser(res.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.message)
      }
    }
  }, [])

  useEffect(() => {
    setup()
  }, [setup])
  
  return (
    <>
      <p>{user}</p>
      <button onClick={setup}> refresh </button>
    </>
  )
}

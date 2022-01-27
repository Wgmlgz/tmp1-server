import { logout } from '../api/api'

export default function Logout() {
  return <button onClick={logout}>logout</button>
}

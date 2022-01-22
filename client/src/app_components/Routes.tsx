import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Dashboard from './Dashboard'
import LoginForm from './Login'
import RegisterForm from './Register'

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to='/login' />} />
        <Route path='/login' element={<LoginForm />} />
        <Route path='/register' element={<RegisterForm />} />
        <Route path='/dashboard/*' element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

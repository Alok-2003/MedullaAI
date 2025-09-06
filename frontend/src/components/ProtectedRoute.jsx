import { Navigate } from 'react-router-dom'

const isAuthed = () => {
  const token = localStorage.getItem('token')
  return !!token
}

export default function ProtectedRoute({ children }) {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />
  }
  return children
}

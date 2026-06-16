import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import './App.css'

function App() {
  // 'login' or 'signup' — controls which page is shown
  const [page, setPage] = useState('login')

  return (
    <>
      {page === 'login' ? (
        <Login onGoToSignup={() => setPage('signup')} />
      ) : (
        <Signup onGoToLogin={() => setPage('login')} />
      )}
    </>
  )
}

export default App

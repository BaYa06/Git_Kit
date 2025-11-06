import { useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/lib/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [msg, setMsg] = useState(null)
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      const data = await apiPost('/v1/auth/login', form)
      setMsg({ type: 'ok', text: data.message || 'Успешный вход' })
    } catch (err) {
      setMsg({ type: 'err', text: err.message })
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Войти</h1>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label>Логин (Email)</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label>Пароль</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} required />
          </div>
          <button className="btn" type="submit">Войти</button>
          {msg && <p className={`msg ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
        </form>
        <p className="mt-4 text-sm">Нет аккаунта? <Link className="link" href="/register">Регистрация</Link></p>
      </div>
    </div>
  )
}

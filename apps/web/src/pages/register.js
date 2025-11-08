import { useState } from 'react'
import Link from 'next/link'
import { apiPost } from '@/lib/api'
import { useRouter } from 'next/router'

export default function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '' })
  const [msg, setMsg] = useState(null)
  const router = useRouter()

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setMsg(null)
    try {
      const data = await apiPost('/v1/auth/register', form)
      // можно оставить сообщение, но мы сразу уходим на /login
      // setMsg({ type: 'ok', text: data.message || 'Успешная регистрация' })
      window.location.href = '/login';
    } catch (err) {
      setMsg({ type: 'err', text: err.message || 'Ошибка регистрации' })
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Регистрация</h1>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label>Имя</label>
            <input className="input" name="first_name" value={form.first_name} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label>Фамилия</label>
            <input className="input" name="last_name" value={form.last_name} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input className="input" type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="mb-3">
            <label>Телефон (Кыргызстан)</label>
            <input className="input" type="tel" name="phone" placeholder="+996xxxxxxxxx" pattern="^\+996\d{9}$" value={form.phone} onChange={onChange} required />
            <p className="text-xs text-gray-500 mt-1">Формат: +996XXXXXXXXX</p>
          </div>
          <div className="mb-3">
            <label>Пароль</label>
            <input className="input" type="password" name="password" value={form.password} onChange={onChange} minLength={6} required />
          </div>
          <button className="btn" type="submit">Создать аккаунт</button>
          {msg && <p className={`msg ${msg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{msg.text}</p>}
        </form>
        <p className="mt-4 text-sm">Уже есть аккаунт? <Link className="link" href="/login">Войти</Link></p>
      </div>
    </div>
  )
}

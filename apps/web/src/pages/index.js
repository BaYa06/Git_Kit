import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1>Git Kit — старт</h1>
        <p className="mb-4">Добро пожаловать! Выберите действие:</p>
        <div className="space-y-3">
          <Link className="btn text-center" href="/register">Регистрация</Link>
          <Link className="btn text-center" href="/login">Войти</Link>
        </div>
      </div>
    </div>
  )
}

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { useLocation, useNavigate } from 'react-router-dom'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

type FormData = z.infer<typeof schema>

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation() as any

  const onSubmit = async (data: FormData) => {
    const res = await api.post('/auth/login', data)
    login(res.data)
    const redirectTo = location.state?.from?.pathname || '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-white shadow p-6 rounded space-y-4">
        <h2 className="text-xl font-semibold">Login</h2>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border rounded px-3 py-2" type="email" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input className="w-full border rounded px-3 py-2" type="password" {...register('password')} />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Login</button>
      </form>
    </div>
  )
}
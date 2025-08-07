import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [parts, setParts] = useState<any[]>([])
  const [items, setItems] = useState<{ partId: string; quantity: number }[]>([])
  const [customer, setCustomer] = useState('')

  const load = () => api.get('/orders').then((res)=>setOrders(res.data))
  useEffect(()=>{ load(); api.get('/parts', { params: { pageSize: 100 } }).then((res)=>setParts(res.data.items)) },[])

  const addItem = () => setItems((prev)=>[...prev, { partId: parts[0]?.id, quantity: 1 }])
  const create = async () => {
    await api.post('/orders', { customer, items })
    setCreating(false); setItems([]); setCustomer(''); load()
  }

  const fulfill = async (id: string) => { await api.post(`/orders/${id}/fulfill`); load() }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Orders</h2>
        <button onClick={()=>setCreating(true)} className="bg-blue-600 text-white px-4 py-2 rounded">New Order</button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead><tr>{['ID','Customer','Status','Items','Actions'].map(h=> <th key={h} className="text-left px-4 py-2 text-sm text-gray-600">{h}</th>)}</tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2">{o.id.slice(0,8)}</td>
                <td className="px-4 py-2">{o.customer}</td>
                <td className="px-4 py-2">{o.status}</td>
                <td className="px-4 py-2">{o.items.length}</td>
                <td className="px-4 py-2 space-x-2">
                  <Link className="text-blue-600" to={`/orders/${o.id}/picklist`}>Picklist</Link>
                  {o.status !== 'FULFILLED' && <button onClick={()=>fulfill(o.id)} className="text-green-600">Fulfill</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center p-4">
          <div className="bg-white rounded shadow p-4 w-full max-w-2xl space-y-3">
            <h3 className="text-lg font-semibold">Create Order</h3>
            <div>
              <label className="block text-sm mb-1">Customer</label>
              <input value={customer} onChange={(e)=>setCustomer(e.target.value)} className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2">
                  <select value={it.partId} onChange={(e)=>{
                    const v = e.target.value; setItems((arr)=>arr.map((x,i)=> i===idx?{...x, partId:v}:x))
                  }} className="border rounded px-3 py-2 flex-1">
                    {parts.map(p => <option key={p.id} value={p.id}>{p.partNumber}</option>)}
                  </select>
                  <input type="number" min={1} value={it.quantity} onChange={(e)=>{
                    const v = parseInt(e.target.value)||1; setItems((arr)=>arr.map((x,i)=> i===idx?{...x, quantity:v}:x))
                  }} className="border rounded px-3 py-2 w-28" />
                </div>
              ))}
              <button onClick={addItem} className="px-3 py-2 bg-gray-200 rounded">Add Item</button>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setCreating(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={create} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
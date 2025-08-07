import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import JsBarcode from 'jsbarcode'

const schema = z.object({
  id: z.string().optional(),
  partNumber: z.string(),
  awtPartNumber: z.string().optional(),
  description: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  category: z.string().optional(),
  binNumber: z.string().optional(),
  location: z.string().optional(),
  unit: z.string().optional(),
  quantityInStock: z.number().int().nonnegative(),
  toOrderExcess: z.string().optional(),
  unitCost: z.number().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
  supplierId: z.string().optional(),
  leadTimeDays: z.number().int().nonnegative(),
  barcode: z.string(),
})

type Part = z.infer<typeof schema>

type Page = { items: Part[]; total: number; page: number; pageSize: number }

export default function Inventory() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page | null>(null)
  const [editing, setEditing] = useState<Part | null>(null)

  const load = () => {
    api.get('/parts', { params: { q, page, pageSize: 20 } }).then((res) => setData(res.data))
  }
  useEffect(() => { load() }, [q, page])

  const onDelete = async (id: string) => {
    await api.delete(`/parts/${id}`)
    load()
  }

  const onCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    await api.post('/parts/upload/csv', form)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="border rounded px-3 py-2 w-full max-w-sm" />
        <button onClick={() => setEditing({ partNumber: '', barcode: '', quantityInStock: 0, unitCost: 0, reorderLevel: 0, leadTimeDays: 0 } as any)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Part</button>
        <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer">
          Upload CSV
          <input type="file" accept=".csv" className="hidden" onChange={onCsv} />
        </label>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Barcode','Part Number','Description','Qty','Unit Cost','Inventory Value','Reorder Level','Actions'].map(h => <th key={h} className="text-left text-sm font-medium text-gray-600 px-4 py-2">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2"><Barcode code={p.barcode} /></td>
                <td className="px-4 py-2">{p.partNumber}</td>
                <td className="px-4 py-2">{p.description}</td>
                <td className="px-4 py-2">{p.quantityInStock}</td>
                <td className="px-4 py-2">${Number(p.unitCost).toFixed(2)}</td>
                <td className="px-4 py-2">${(Number(p.unitCost) * Number(p.quantityInStock)).toFixed(2)}</td>
                <td className="px-4 py-2">{p.reorderLevel}</td>
                <td className="px-4 py-2 space-x-2">
                  <button onClick={() => setEditing(p)} className="text-blue-600">Edit</button>
                  <button onClick={() => onDelete(p.id!)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex items-center gap-2">
          <button disabled={page<=1} onClick={() => setPage((p)=>p-1)} className="px-3 py-2 bg-gray-200 rounded">Prev</button>
          <div>Page {page}</div>
          <button disabled={(page*20)>=data.total} onClick={() => setPage((p)=>p+1)} className="px-3 py-2 bg-gray-200 rounded">Next</button>
        </div>
      )}

      {editing && <EditModal value={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null); load()}} />}
    </div>
  )
}

function Barcode({ code }: { code: string }) {
  const svgId = useMemo(() => `bc_${Math.random().toString(36).slice(2)}`, [])
  useEffect(() => {
    try { JsBarcode(`#${svgId}`, code, { format: 'CODE128', displayValue: false }) } catch {}
  }, [code, svgId])
  return <svg id={svgId}></svg>
}

function EditModal({ value, onClose, onSaved }: { value: Partial<Part>, onClose: ()=>void, onSaved: ()=>void }) {
  const defaults: Part = {
    id: value.id,
    partNumber: value.partNumber || '',
    awtPartNumber: value.awtPartNumber,
    description: value.description,
    size: value.size,
    material: value.material,
    category: value.category,
    binNumber: value.binNumber,
    location: value.location,
    unit: value.unit,
    quantityInStock: value.quantityInStock ?? 0,
    toOrderExcess: value.toOrderExcess,
    unitCost: value.unitCost ?? 0,
    reorderLevel: value.reorderLevel ?? 0,
    supplierId: value.supplierId,
    leadTimeDays: value.leadTimeDays ?? 0,
    barcode: value.barcode || '',
  }
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<Part>({ resolver: zodResolver(schema), defaultValues: defaults })
  useEffect(()=>{ Object.entries(defaults).forEach(([k,v])=>setValue(k as any, v as any)) }, [value])

  const onSubmit = async (data: Part) => {
    if (data.id) await api.put(`/parts/${data.id}`, data)
    else await api.post('/parts', data)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded shadow p-4 w-full max-w-2xl grid grid-cols-2 gap-3">
        <h3 className="col-span-2 text-lg font-semibold">{value.id ? 'Edit Part' : 'Add Part'}</h3>
        {['partNumber','awtPartNumber','description','size','material','category','binNumber','location','unit','toOrderExcess','barcode'].map((f)=> (
          <div key={f} className="col-span-1">
            <label className="block text-sm mb-1">{f}</label>
            <input className="w-full border rounded px-3 py-2" {...register(f as any)} />
          </div>
        ))}
        {['quantityInStock','unitCost','reorderLevel','leadTimeDays'].map((f)=> (
          <div key={f} className="col-span-1">
            <label className="block text-sm mb-1">{f}</label>
            <input type="number" step="any" className="w-full border rounded px-3 py-2" {...register(f as any, { valueAsNumber: true })} />
          </div>
        ))}
        {errors.barcode && <div className="col-span-2 text-red-600 text-sm">{errors.barcode.message as any}</div>}
        <div className="col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  )
}
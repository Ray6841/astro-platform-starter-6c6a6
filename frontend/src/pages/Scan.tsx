import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { api } from '../lib/api'

export default function Scan(){
  const videoRef = useRef<HTMLVideoElement>(null)
  const [code, setCode] = useState('')
  const [qty, setQty] = useState(1)
  const [result, setResult] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    const reader = new BrowserMultiFormatReader()
    const controlsPromise = reader.decodeFromVideoDevice(undefined, videoRef.current!, (res, err) => {
      if (res) setCode(res.getText())
      if (err && !(err as any).message?.includes('No MultiFormat Readers')) setError('Camera access error')
    })
    return () => { controlsPromise.then(c => c?.stop()) }
  },[])

  const onSearch = async () => {
    if (!code) return
    try {
      const res = await api.get(`/parts/barcode/${encodeURIComponent(code)}`)
      setResult(res.data)
    } catch { setResult(null) }
  }

  const adjust = async (delta: number) => {
    if (!result) return
    await api.put(`/parts/${result.id}`, { quantityInStock: Math.max(0, (result.quantityInStock||0) + delta) })
    const refreshed = await api.get(`/parts/barcode/${encodeURIComponent(code)}`)
    setResult(refreshed.data)
  }

  return (
    <div className="grid gap-4">
      {error && <div className="text-red-600">{error}</div>}
      <video ref={videoRef} className="w-full max-w-md bg-black rounded" />
      <div className="flex gap-2 items-end">
        <input className="border rounded px-3 py-2" placeholder="Barcode" value={code} onChange={(e)=>setCode(e.target.value)} />
        <button onClick={onSearch} className="px-3 py-2 bg-gray-200 rounded">Search</button>
        <input type="number" min={1} className="border rounded px-3 py-2 w-24" value={qty} onChange={(e)=>setQty(parseInt(e.target.value)||1)} />
        <button onClick={()=>adjust(qty)} className="px-3 py-2 bg-green-600 text-white rounded">Add</button>
        <button onClick={()=>adjust(-qty)} className="px-3 py-2 bg-red-600 text-white rounded">Remove</button>
      </div>
      {result && (
        <div className="bg-white rounded shadow p-4">
          <div className="font-semibold">{result.partNumber}</div>
          <div className="text-sm text-gray-600">Qty: {result.quantityInStock}</div>
        </div>
      )}
    </div>
  )
}
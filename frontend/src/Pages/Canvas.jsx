import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, endpoints } from '../api/client'

export default function Canvas() {
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  // Canvas state
  const [imageUrl, setImageUrl] = useState('')
  const containerRef = useState(null)[0]
  const [containerEl, setContainerEl] = useState(null)
  const [patches, setPatches] = useState([]) // {id, x, y, w, h, color, opacity}
  const [activeId, setActiveId] = useState(null)
  const [dragging, setDragging] = useState(null) // {id, offsetX, offsetY}
  const [resizing, setResizing] = useState(null) // {id, startX, startY, startW, startH}

  // Track current patches to avoid overwriting local with empty server state
  const patchesRef = useRef([])
  useEffect(() => { patchesRef.current = patches }, [patches])

  // Load once (no sockets/polling): initialize patches from server (if any),
  // and always sync to localStorage for UX-first editing.
  useEffect(() => {
    const load = async () => {
      try {
        // 1) Who am I
        const meRes = await api.get(endpoints.me)
        if (meRes?.data?.success) setMe(meRes.data.user)

        // 2) Initialize board (patches only) once
        // Prefer server patches, but if localStorage has data, keep user's local work
        const local = localStorage.getItem('patches')
        let localPatches = []
        try { localPatches = JSON.parse(local || '[]') } catch { localPatches = [] }

        const boardRes = await api.get('/canvas')
        const serverPatches = boardRes?.data?.board?.patches || []

        if ((localPatches?.length || 0) > 0) {
          setPatches(localPatches)
        } else if (serverPatches.length > 0) {
          setPatches(serverPatches)
          localStorage.setItem('patches', JSON.stringify(serverPatches))
        } else {
          // nothing yet; ensure localStorage has default empty array
          localStorage.setItem('patches', JSON.stringify([]))
        }
      } catch (err) {
        toast.error('Session expired, please login again')
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
    // no sockets to cleanup
    return () => {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('token')
    toast.success('Logged out')
    navigate('/login')
  }

  // Local storage sync for patches
  const saveLocalPatches = (next) => {
    try { localStorage.setItem('patches', JSON.stringify(next)) } catch {}
  }

  // Helpers for percentages <-> pixels
  const getContainerRect = () => containerEl?.getBoundingClientRect()
  const pxToPct = (px, total) => Math.max(0, Math.min(100, (px / total) * 100))
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

  const onUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    // Keep existing patches intact; do not clear
    setActiveId(null)
  }

  const addPatch = () => {
    if (!containerEl) return toast.error('Upload an image first')
    const id = crypto.randomUUID()
    const newPatch = { id, x: 35, y: 35, w: 30, h: 20, color: '#ef4444', opacity: 0.4 }
    setPatches((p) => {
      const next = [...p, newPatch]
      saveLocalPatches(next)
      return next
    })
    setActiveId(id)
  }

  const onPatchMouseDown = (e, id) => {
    e.stopPropagation()
    setActiveId(id)
    const rect = getContainerRect()
    if (!rect) return
    const patch = patches.find((p) => p.id === id)
    if (!patch) return
    // Calculate mouse offset inside the patch
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const patchLeft = (patch.x / 100) * rect.width
    const patchTop = (patch.y / 100) * rect.height
    setDragging({ id, offsetX: mouseX - patchLeft, offsetY: mouseY - patchTop })
  }

  const onHandleMouseDown = (e, id) => {
    e.stopPropagation()
    const rect = getContainerRect()
    if (!rect) return
    const patch = patches.find((p) => p.id === id)
    if (!patch) return
    setResizing({
      id,
      startX: e.clientX,
      startY: e.clientY,
      startW: patch.w,
      startH: patch.h,
    })
  }

  const onMouseMove = (e) => {
    const rect = getContainerRect()
    if (!rect) return
    // Dragging
    if (dragging) {
      const { id, offsetX, offsetY } = dragging
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      let left = pxToPct(mouseX - offsetX, rect.width)
      let top = pxToPct(mouseY - offsetY, rect.height)
      // Constrain within container by considering patch size
      const patch = patches.find((p) => p.id === id)
      if (!patch) return
      left = clamp(left, 0, 100 - patch.w)
      top = clamp(top, 0, 100 - patch.h)
      setPatches((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, x: left, y: top } : p))
        saveLocalPatches(next)
        return next
      })
    }
    // Resizing (bottom-right handle)
    if (resizing) {
      const { id, startX, startY, startW, startH } = resizing
      const dx = ((e.clientX - startX) / rect.width) * 100
      const dy = ((e.clientY - startY) / rect.height) * 100
      const patch = patches.find((p) => p.id === id)
      if (!patch) return
      let newW = clamp(startW + dx, 5, 100 - patch.x)
      let newH = clamp(startH + dy, 5, 100 - patch.y)
      setPatches((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, w: newW, h: newH } : p))
        saveLocalPatches(next)
        return next
      })
    }
  }

  const onMouseUp = () => {
    if (dragging) setDragging(null)
    if (resizing) setResizing(null)
  }

  const updatePatch = (id, updates) => setPatches((prev) => {
    const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    saveLocalPatches(next)
    return next
  })
  const removePatch = (id) => setPatches((prev) => {
    const next = prev.filter((p) => p.id !== id)
    saveLocalPatches(next)
    return next
  })

  // Save button handler: persist localStorage patches to MongoDB
  const saveToServer = async () => {
    try {
      const raw = localStorage.getItem('patches')
      let payload = []
      try { payload = JSON.parse(raw || '[]') } catch { payload = patches }
      await api.put('/canvas', { patches: payload })
      toast.success('Patches saved')
    } catch (e) {
      toast.error('Failed to save patches')
    }
  }

  return (
    <div className="min-h-[60vh]"> 
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-white/10 rounded" />
            <div className="h-40 w-full bg-white/10 rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">AI Canvas</h1>
                <p className="text-white/70">Welcome{me ? `, ${me.name}` : ''}!</p>
            </div>
            <div className="mt-6 grid lg:grid-cols-12 gap-6">
              {/* Canvas Area */}
              <div className="lg:col-span-8 rounded-xl p-4 bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <label className="inline-flex items-center px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                    Upload Image
                  </label>
                  <button onClick={addPatch} className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white disabled:opacity-50" disabled={!imageUrl}>Add Heat Patch</button>
                  <button onClick={saveToServer} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15">Save</button>
                </div>

                <div
                  ref={setContainerEl}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseUp}
                  className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-800 border border-white/10 select-none"
                  style={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                  }}
                >
                  {patches.map((p) => (
                    <div
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      onMouseDown={(e) => onPatchMouseDown(e, p.id)}
                      onKeyDown={() => setActiveId(p.id)}
                      className={`absolute rounded-lg ${activeId === p.id ? 'ring-2 ring-cyan-400' : ''}`}
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.w}%`,
                        height: `${p.h}%`,
                        background: `radial-gradient(circle at 50% 50%, ${p.color}aa, ${p.color}55 60%, transparent 80%)`,
                        opacity: p.opacity,
                        cursor: 'move',
                      }}
                    >
                      {/* Resize handle */}
                      <div
                        onMouseDown={(e) => onHandleMouseDown(e, p.id)}
                        className="absolute bottom-1 right-1 h-3 w-3 rounded-sm bg-white/90 cursor-se-resize"
                        title="Resize"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Details Panel */}
              <div className="lg:col-span-4 rounded-xl p-4 bg-white/5 border border-white/10">
                <h3 className="font-medium mb-3">Heat Patches</h3>
                {patches.length === 0 ? (
                  <p className="text-white/60 text-sm">No patches yet. Upload an image and click "Add Heat Patch".</p>
                ) : (
                  <div className="space-y-3">
                    {patches.map((p, idx) => (
                      <div key={p.id} className={`p-3 rounded-lg border ${activeId === p.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Patch #{idx + 1}</div>
                          <div className="flex items-center gap-2">
                            <input type="color" value={p.color} onChange={(e) => updatePatch(p.id, { color: e.target.value })} title="Color" />
                            <button onClick={() => removePatch(p.id)} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/15">Remove</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-white/80">
                          <div>X: {p.x.toFixed(1)}%</div>
                          <div>Y: {p.y.toFixed(1)}%</div>
                          <div>W: {p.w.toFixed(1)}%</div>
                          <div>H: {p.h.toFixed(1)}%</div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <label className="opacity-80">Opacity</label>
                          <input type="range" min="0.1" max="1" step="0.05" value={p.opacity} onChange={(e) => updatePatch(p.id, { opacity: Number(e.target.value) })} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
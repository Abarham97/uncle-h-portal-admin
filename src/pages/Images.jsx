import { useState, useEffect } from 'react'
import config from '../config'

const EMPTY_FORM = { beforeFile: null, afterFile: null, beforeUrl: '', afterUrl: '' }

export default function Images() {
  const [images, setImages]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [isEdit, setIsEdit]     = useState(false)
  const [editId, setEditId]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [lightbox, setLightbox] = useState(null) // { url, label }

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${config.apiUrl}/api/images`)
      const data = await res.json()
      setImages(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setIsEdit(false)
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (img) => {
    setForm({ beforeFile: null, afterFile: null, beforeUrl: img.beforeImageUrl || '', afterUrl: img.afterImageUrl || '' })
    setIsEdit(true)
    setEditId(img.id)
    setShowForm(true)
  }

  // ── Upload a single file to the backend wwwroot folder ──────────────────────
  // To switch to Supabase: replace this function only.
  // Supabase version will call supabase.storage.from('Images').upload(...) instead.
  const uploadFile = async (file, slot) => {
    const fd = new FormData()
    fd.append(slot === 'before' ? 'beforeImage' : 'afterImage', file)
    const res = await fetch(`${config.apiUrl}/api/images/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return slot === 'before' ? data.beforeUrl : data.afterUrl
  }

  const saveImage = async () => {
    setSaving(true)
    try {
      let beforeUrl = form.beforeUrl
      let afterUrl  = form.afterUrl

      if (form.beforeFile) beforeUrl = await uploadFile(form.beforeFile, 'before')
      if (form.afterFile)  afterUrl  = await uploadFile(form.afterFile,  'after')

      if (!beforeUrl || !afterUrl) { setSaving(false); return }

      if (isEdit) {
        await fetch(`${config.apiUrl}/api/images/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editId, beforeImageUrl: beforeUrl, afterImageUrl: afterUrl }),
        })
      } else {
        await fetch(`${config.apiUrl}/api/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ beforeImageUrl: beforeUrl, afterImageUrl: afterUrl }),
        })
      }

      setShowForm(false)
      fetchImages()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const deleteImage = async (id) => {
    if (!confirm('Delete this image pair? The record will be removed but the files stay on disk.')) return
    try {
      await fetch(`${config.apiUrl}/api/images/${id}`, { method: 'DELETE' })
      fetchImages()
    } catch (e) { console.error(e) }
  }

  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ padding: 32, height: '100vh', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Before &amp; After</h2>
          <div style={{ fontSize: 12, color: '#555' }}>{images.length} pair{images.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={openAdd} style={btnRed}>+ Add Pair</button>
      </div>

      {/* Gallery grid */}
      {loading ? (
        <div style={{ color: '#555', fontSize: 13 }}>Loading...</div>
      ) : images.length === 0 ? (
        <div style={{ color: '#555', fontSize: 13 }}>No image pairs yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {images.map(img => (
            <div key={img.id} style={{ background: '#141414', border: '1px solid #222', overflow: 'hidden' }}>
              {/* Before / After thumbnails side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#0f0f0f' }}>
                <ImageThumb
                  src={img.beforeImageUrl}
                  label="BEFORE"
                  labelColor="#888"
                  onClick={() => setLightbox({ url: img.beforeImageUrl, label: 'Before' })}
                />
                <ImageThumb
                  src={img.afterImageUrl}
                  label="AFTER"
                  labelColor="#cc1414"
                  onClick={() => setLightbox({ url: img.afterImageUrl, label: 'After' })}
                />
              </div>

              {/* Card footer */}
              <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#444' }}>#{img.id} · {fmt(img.createdAt)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(img)} style={btnTiny}>Edit</button>
                  <button onClick={() => deleteImage(img.id)} style={btnTinyDanger}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, cursor: 'zoom-out',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: -26, left: 0, fontSize: 10, color: '#555', letterSpacing: 2 }}>
              {lightbox.label.toUpperCase()} — click anywhere to close
            </div>
            <img
              src={lightbox.url}
              alt={lightbox.label}
              style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#141414', border: '1px solid #333', padding: 32, width: 560, maxWidth: '92vw' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 24 }}>
              {isEdit ? 'Edit Image Pair' : 'Add Image Pair'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <SlotPicker
                label="Before"
                file={form.beforeFile}
                previewUrl={form.beforeUrl}
                onChange={f => setForm(p => ({ ...p, beforeFile: f }))}
              />
              <SlotPicker
                label="After"
                file={form.afterFile}
                previewUrl={form.afterUrl}
                onChange={f => setForm(p => ({ ...p, afterFile: f }))}
              />
            </div>

            {!isEdit && (!form.beforeFile || !form.afterFile) && (
              <div style={{ fontSize: 11, color: '#555', marginTop: 12 }}>
                Both images are required for a new pair.
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button
                onClick={saveImage}
                disabled={saving || (!isEdit && (!form.beforeFile || !form.afterFile))}
                style={{ ...btnRed, opacity: saving || (!isEdit && (!form.beforeFile || !form.afterFile)) ? 0.5 : 1 }}
              >
                {saving ? 'Uploading...' : isEdit ? 'Save Changes' : 'Add Pair'}
              </button>
              <button onClick={() => setShowForm(false)} style={btnGhost}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

function ImageThumb({ src, label, labelColor, onClick }) {
  const [broken, setBroken] = useState(false)
  return (
    <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={onClick}>
      <div style={{
        position: 'absolute', top: 6, left: 6, zIndex: 1,
        fontSize: 9, background: 'rgba(0,0,0,0.75)', color: labelColor,
        padding: '2px 6px', letterSpacing: 1,
      }}>
        {label}
      </div>
      {broken || !src ? (
        <div style={{ background: '#1a1a1a', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#333' }}>No image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          onError={() => setBroken(true)}
          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
        />
      )}
    </div>
  )
}

function SlotPicker({ label, file, previewUrl, onChange }) {
  const previewSrc = file ? URL.createObjectURL(file) : previewUrl
  return (
    <div>
      <label style={labelStyle}>{label} Image</label>
      {previewSrc && (
        <img
          src={previewSrc}
          alt={label}
          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', marginBottom: 8, border: '1px solid #222' }}
        />
      )}
      <label style={{
        ...inputStyle, display: 'flex', alignItems: 'center',
        cursor: 'pointer', padding: '8px 12px', color: file ? '#fff' : '#555', fontSize: 12,
      }}>
        {file ? file.name : 'Choose file…'}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => onChange(e.target.files[0] || null)}
        />
      </label>
    </div>
  )
}

/* ── Styles ──────────────────────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
  color: '#fff', padding: '10px 12px', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
const labelStyle = {
  fontSize: 10, color: '#555', letterSpacing: 1,
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
}
const btnRed = {
  background: '#cc1414', color: '#fff', border: 'none', padding: '8px 16px',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 1,
}
const btnGhost = {
  background: 'transparent', color: '#666', border: '1px solid #333',
  padding: '8px 16px', fontSize: 12, cursor: 'pointer', letterSpacing: 1,
}
const btnTiny = {
  background: 'transparent', color: '#666', border: '1px solid #2a2a2a',
  padding: '4px 10px', fontSize: 11, cursor: 'pointer', letterSpacing: 0.5,
}
const btnTinyDanger = {
  background: 'transparent', color: '#cc1414', border: '1px solid #cc1414',
  padding: '4px 10px', fontSize: 11, cursor: 'pointer', letterSpacing: 0.5,
}

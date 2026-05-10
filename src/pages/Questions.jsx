import { useState, useEffect } from 'react'
import config from '../config'
import { useIsMobile } from '../hooks/useIsMobile'

const EMPTY_QUESTION = { parentID: 0, question: '', answer: '', sortOrder: 0 }

export default function Questions() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_QUESTION)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [parentFilter, setParentFilter] = useState(0)
  const [breadcrumb, setBreadcrumb] = useState([{ id: 0, label: 'Root' }])
  const isMobile = useIsMobile()

  useEffect(() => { fetchQuestions(parentFilter) }, [parentFilter])

  const fetchQuestions = async (parentId) => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/questions?parentId=${parentId}`)
      const data = await res.json()
      setQuestions(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const navigateInto = (q) => {
    setParentFilter(q.id)
    setBreadcrumb(b => [...b, { id: q.id, label: q.question }])
    setSelected(null)
  }

  const navigateTo = (crumb, index) => {
    setParentFilter(crumb.id)
    setBreadcrumb(b => b.slice(0, index + 1))
    setSelected(null)
  }

  const openAdd = () => {
    setFormData({ ...EMPTY_QUESTION, parentID: parentFilter })
    setIsEdit(false)
    setShowForm(true)
  }

  const openEdit = (q) => {
    setFormData({ ...q })
    setIsEdit(true)
    setShowForm(true)
  }

  const saveQuestion = async () => {
    setSaving(true)
    try {
      const url = isEdit
        ? `${config.apiUrl}/api/questions/${formData.id}`
        : `${config.apiUrl}/api/questions`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowForm(false)
        setFormData(EMPTY_QUESTION)
        fetchQuestions(parentFilter)
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return
    try {
      await fetch(`${config.apiUrl}/api/questions/${id}`, { method: 'DELETE' })
      fetchQuestions(parentFilter)
      setSelected(null)
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: isMobile ? 16 : 32, height: '100vh', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Questions</h2>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ color: '#444' }}>›</span>}
                <span
                  onClick={() => navigateTo(crumb, i)}
                  style={{
                    fontSize: 12, color: i === breadcrumb.length - 1 ? '#fff' : '#cc1414',
                    cursor: i === breadcrumb.length - 1 ? 'default' : 'pointer',
                    maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {breadcrumb.length > 1 && (
            <button onClick={() => navigateTo(breadcrumb[breadcrumb.length - 2], breadcrumb.length - 2)} style={btnGhost}>
              ← Back
            </button>
          )}
          <button onClick={openAdd} style={btnRed}>+ Add Question</button>
        </div>
      </div>

      {/* Questions list */}
      {loading ? (
        <div style={{ color: '#555', fontSize: 13 }}>Loading...</div>
      ) : questions.length === 0 ? (
        <div style={{ color: '#555', fontSize: 13 }}>No questions here — add one!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {questions.map(q => (
            <div key={q.id} style={{
              background: '#141414', border: '1px solid #222',
              padding: '16px 20px',
              borderLeft: selected?.id === q.id ? '3px solid #cc1414' : '3px solid transparent',
            }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{q.question}</div>
                {q.answer
                  ? <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{q.answer}</div>
                  : <div style={{ fontSize: 11, color: '#cc1414', letterSpacing: 1 }}>HAS CHILDREN →</div>
                }
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!q.answer && (
                  <button onClick={() => navigateInto(q)} style={btnGhost}>View Children</button>
                )}
                <button onClick={() => openEdit(q)} style={btnGhost}>Edit</button>
                <button onClick={() => deleteQuestion(q.id)} style={btnDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#141414', border: '1px solid #333', padding: isMobile ? 20 : 32, width: 540, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 24 }}>
              {isEdit ? 'Edit Question' : 'Add Question'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Question</label>
                <input
                  value={formData.question}
                  onChange={e => setFormData(f => ({ ...f, question: e.target.value }))}
                  placeholder="e.g. What services do you offer?"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Answer <span style={{ color: '#444' }}>(leave empty if this leads to more questions)</span></label>
                <textarea
                  value={formData.answer || ''}
                  onChange={e => setFormData(f => ({ ...f, answer: e.target.value }))}
                  placeholder="Leave empty if this question has sub-questions..."
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={e => setFormData(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button onClick={saveQuestion} disabled={saving} style={btnRed}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Question'}
              </button>
              <button onClick={() => { setShowForm(false); setFormData(EMPTY_QUESTION) }} style={btnGhost}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
  color: '#fff', padding: '10px 12px', fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
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
const btnDanger = {
  background: 'transparent', color: '#cc1414', border: '1px solid #cc1414',
  padding: '8px 16px', fontSize: 12, cursor: 'pointer', letterSpacing: 1,
}
import { useState, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
const titleCase = (r) => r.charAt(0) + r.slice(1).toLowerCase()

// Resize any picked image to a small square JPEG data URL so the payload stays tiny.
function fileToAvatar(file, size = 160) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = canvas.height = size
        const ctx = canvas.getContext('2d')
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Role-agnostic profile: shown inside each dashboard shell's own header.
function ProfilePanel() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef(null)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [avatar, setAvatar] = useState(user.avatarUrl || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  function startEdit() {
    setName(user.fullName)
    setEmail(user.email)
    setAvatar(user.avatarUrl || '')
    setErr('')
    setMsg('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setErr('')
    setMsg('')
  }

  async function pickPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setErr('Please choose an image file')
    try {
      setAvatar(await fileToAvatar(file))
      setErr('')
    } catch {
      setErr('Could not read that image')
    }
  }

  async function saveDetails(e) {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!name.trim()) return setErr('Name cannot be empty')
    if (!email.trim()) return setErr('Email cannot be empty')
    setSaving(true)
    try {
      const body = { fullName: name.trim(), email: email.trim() }
      if (avatar !== (user.avatarUrl || '')) body.settings = { avatarUrl: avatar }
      await api.put('/api/settings', body)
      updateUser({ fullName: name.trim(), email: email.trim(), avatarUrl: avatar })
      setMsg('Saved ✓')
      setEditing(false)
    } catch (e) {
      setErr(e.response?.data?.error || 'Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword(e) {
    e.preventDefault()
    setPwErr('')
    setPwMsg('')
    if (pw.newPassword !== pw.confirm) return setPwErr('New passwords do not match')
    if (pw.newPassword.length < 8) return setPwErr('New password must be at least 8 characters')
    setSavingPw(true)
    try {
      await api.post('/api/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      })
      setPw({ currentPassword: '', newPassword: '', confirm: '' })
      setPwMsg('Password changed ✓')
    } catch (e) {
      const d = e.response?.data
      setPwErr((d?.details && Object.values(d.details)[0]?.[0]) || d?.error || 'Could not change password')
    } finally {
      setSavingPw(false)
    }
  }

  const headAvatar = user.avatarUrl
    ? <img className="avatar-img-lg" src={user.avatarUrl} alt={user.fullName} />
    : <div className="profile-avatar">{initialsOf(user.fullName)}</div>

  return (
    <div className="page-body">
      <div className="profile-head">
        {headAvatar}
        <div>
          <div className="profile-name">{user.fullName}</div>
          <div className="profile-sub">{user.email} · {titleCase(user.role)}</div>
          {user.createdAt && (
            <div className="profile-sub">Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          )}
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-card">
          <div className="settings-card-head">
            <h2 className="settings-card-title">Account details</h2>
            {!editing && (
              <button type="button" className="table-action" onClick={startEdit}>Edit</button>
            )}
          </div>

          <form onSubmit={saveDetails}>
            {editing && (
              <div className="settings-field">
                <label>Profile picture</label>
                <div className="avatar-edit">
                  {avatar
                    ? <img className="avatar-img-edit" src={avatar} alt="" />
                    : <div className="profile-avatar">{initialsOf(name || user.fullName)}</div>}
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
                  <button type="button" className="table-action" onClick={() => fileRef.current?.click()}>
                    {avatar ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatar && (
                    <button type="button" className="table-action" onClick={() => setAvatar('')}>Remove</button>
                  )}
                </div>
              </div>
            )}

            <div className="settings-field">
              <label>Full name</label>
              <input value={editing ? name : user.fullName}
                onChange={(e) => setName(e.target.value)} readOnly={!editing} />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input type="email" value={editing ? email : user.email}
                onChange={(e) => setEmail(e.target.value)} readOnly={!editing} />
            </div>
            <div className="settings-field">
              <label>Role</label>
              <input value={titleCase(user.role)} readOnly title="Role can only be changed by an administrator" />
            </div>

            {err && <p className="error-text">{err}</p>}
            {msg && <div className="export-success">{msg}</div>}

            {editing && (
              <div className="settings-actions">
                <button className="btn-cta" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button className="table-action" type="button" onClick={cancelEdit}>Cancel</button>
              </div>
            )}
          </form>
        </div>

        <div className="settings-card">
          <h2 className="settings-card-title">Change password</h2>
          <form onSubmit={changePassword}>
            <div className="settings-field">
              <label>Current password</label>
              <input type="password" value={pw.currentPassword}
                onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
            </div>
            <div className="settings-field">
              <label>New password</label>
              <input type="password" value={pw.newPassword}
                onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} minLength={8} required />
            </div>
            <div className="settings-field">
              <label>Confirm new password</label>
              <input type="password" value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })} minLength={8} required />
            </div>
            {pwErr && <p className="error-text">{pwErr}</p>}
            {pwMsg && <div className="export-success">{pwMsg}</div>}
            <button className="btn-cta" type="submit" disabled={savingPw}>
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePanel

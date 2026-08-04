import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
const titleCase = (r) => r.charAt(0) + r.slice(1).toLowerCase()

// Role-agnostic profile: shown inside each dashboard shell's own header.
function ProfilePanel() {
  const { user, updateUser } = useAuth()

  const [name, setName] = useState(user.fullName)
  const [savingName, setSavingName] = useState(false)
  const [nameMsg, setNameMsg] = useState('')
  const [nameErr, setNameErr] = useState('')

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')

  async function saveName(e) {
    e.preventDefault()
    setNameErr('')
    setNameMsg('')
    if (!name.trim()) return setNameErr('Name cannot be empty')
    setSavingName(true)
    try {
      await api.put('/api/settings', { fullName: name.trim() })
      updateUser({ fullName: name.trim() })
      setNameMsg('Saved ✓')
    } catch (e) {
      setNameErr(e.response?.data?.error || 'Could not update name')
    } finally {
      setSavingName(false)
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

  return (
    <div className="page-body">
      <div className="profile-head">
        <div className="profile-avatar">{initialsOf(user.fullName)}</div>
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
          <h2 className="settings-card-title">Account details</h2>
          <form onSubmit={saveName}>
            <div className="settings-field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input value={user.email} readOnly />
            </div>
            <div className="settings-field">
              <label>Role</label>
              <input value={titleCase(user.role)} readOnly />
            </div>
            {nameErr && <p className="error-text">{nameErr}</p>}
            {nameMsg && <div className="export-success">{nameMsg}</div>}
            <button className="btn-cta" type="submit" disabled={savingName}>
              {savingName ? 'Saving…' : 'Save changes'}
            </button>
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

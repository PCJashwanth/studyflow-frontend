import { useState } from 'react'

// Shared shell for the Login and Signup screens: navy brand panel on the
// left (logo centred above the tagline), the form on the right.
function AuthLayout({ headline, tagline, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-logo">
          <span className="auth-brand-mark">S</span>
          <span className="auth-brand-name">StudyFlow</span>
        </div>

        <h2 className="auth-brand-headline">{headline}</h2>
        {tagline && <p className="auth-brand-tagline">{tagline}</p>}
      </aside>

      <main className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  )
}

// Password input with a Show/Hide button, so people can check what they typed.
export function PasswordField({ id, label, value, onChange, autoComplete, minLength, children }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <EyeIcon off={visible} />
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {children}
    </div>
  )
}

function EyeIcon({ off }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="21" x2="21" y2="3" />}
    </svg>
  )
}

export default AuthLayout

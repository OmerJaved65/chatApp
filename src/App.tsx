import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const sendSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }

    setStatus('sending')

    const apiUrl = (import.meta as any).env.VITE_SUBSCRIBE_API as string | undefined
    const emailJsService = (import.meta as any).env.VITE_EMAILJS_SERVICE as string | undefined
    const emailJsTemplate = (import.meta as any).env.VITE_EMAILJS_TEMPLATE as string | undefined
    const emailJsUser = (import.meta as any).env.VITE_EMAILJS_USER as string | undefined

    try {
      if (apiUrl) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        setStatus('success')
        setMessage('Thanks — check your inbox for confirmation!')
        setEmail('')
        return
      }

      if (emailJsService && emailJsTemplate && emailJsUser) {
        // Send via EmailJS REST API
        const payload = {
          service_id: emailJsService,
          template_id: emailJsTemplate,
          user_id: emailJsUser,
          template_params: { user_email: email }
        }
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('EmailJS request failed')
        setStatus('success')
        setMessage('Subscription confirmed — check your mail!')
        setEmail('')
        return
      }

      // Fallback: simulate success (for local dev without backend)
      console.warn('No subscribe endpoint configured; using local fallback')
      setTimeout(() => {
        setStatus('success')
        setMessage('Thanks — check your inbox!')
        setEmail('')
      }, 700)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setMessage(err?.message || 'An error occurred')
    }
  }

  return (
    <div className="center-wrapper">
      <div className="center-card">
        <header className="card-hero">
          <h1 className="title">SparkChat — Coming Soon</h1>
          <p className="subtitle">A modern, private, and lightning-fast chat experience for teams and friends.</p>
          <div className="cta-row">
            <button className="btn primary" onClick={() => window.location.hash = '#notify'}>Get Notified</button>
            <a className="btn ghost" href="https://github.com/OmerJaved65/chatApp" target="_blank" rel="noreferrer">View Repo</a>
          </div>
        </header>

        <main className="card-content">
          <section className="feature-grid">
            <div className="feature">
              <h3>Private by Design</h3>
              <p>End-to-end encryption and modern security defaults so your conversations stay yours.</p>
            </div>
            <div className="feature">
              <h3>Fast & Lightweight</h3>
              <p>Optimized for snappy performance on desktop and mobile — minimal resource usage.</p>
            </div>
            <div className="feature">
              <h3>Rich Messaging</h3>
              <p>Typing indicators, reactions, threads, and media sharing coming soon.</p>
            </div>
          </section>

          <section className="notify" id="notify">
            <h3>Want early access?</h3>
            <p>Enter your email and we'll notify you when SparkChat launches.</p>
            <form className="notify-form" onSubmit={sendSubscription}>
              <input aria-label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Notify Me'}</button>
            </form>
            {status === 'success' && <div className="notify-success" role="status">{message}</div>}
            {status === 'error' && <div className="notify-error" role="alert">{message}</div>}
          </section>
        </main>

        <footer className="card-footer">
          <span>© {new Date().getFullYear()} SparkChat</span>
          <a href="https://github.com/OmerJaved65/chatApp" target="_blank" rel="noreferrer">GitHub</a>
        </footer>
      </div>
    </div>
  )
}

export default App

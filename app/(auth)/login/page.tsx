'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Step = 'choose' | 'phone' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('choose')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    if (error) { setError(error.message) } else { setStep('otp') }
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: 'sms' })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🏏</div>
        <h1 className="text-2xl font-bold text-gray-900">Khedan</h1>
        <p className="text-gray-500 text-sm mt-1">Your cricket community</p>
      </div>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      {step === 'choose' && (
        <div className="space-y-4">
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-200" /><span className="text-gray-400 text-sm">or</span><div className="flex-1 h-px bg-gray-200" /></div>
          <button onClick={() => setStep('phone')} className="w-full bg-green-600 text-white rounded-xl py-3 px-4 font-medium hover:bg-green-700 transition-colors">Continue with Phone</button>
        </div>
      )}
      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="flex gap-2">
            <span className="flex items-center px-3 bg-gray-100 rounded-xl text-gray-600 font-medium text-sm border border-gray-200">+91</span>
            <input type="tel" placeholder="10-digit number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>
          <button type="submit" disabled={loading || phone.length < 10} className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50">{loading ? 'Sending...' : 'Send OTP'}</button>
          <button type="button" onClick={() => setStep('choose')} className="w-full text-gray-500 text-sm">Back</button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-gray-600 text-sm text-center">Enter the 6-digit code sent to +91{phone}</p>
          <input type="text" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500" required />
          <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition-colors disabled:opacity-50">{loading ? 'Verifying...' : 'Verify OTP'}</button>
          <button type="button" onClick={() => setStep('phone')} className="w-full text-gray-500 text-sm">Change number</button>
        </form>
      )}
    </div>
  )
}

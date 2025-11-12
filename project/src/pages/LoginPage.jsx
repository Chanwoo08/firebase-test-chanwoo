// src/pages/LoginPage.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, UserPlus, Moon, Sun } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [dark, setDark] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('이메일과 비밀번호를 입력해주세요.')
    const res = await login({ email, password })
    if (!res.ok) setError(res.error || '로그인 실패')
    else navigate('/main1')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('이메일과 비밀번호를 입력해주세요.')
    if (password !== confirm) return setError('비밀번호가 일치하지 않습니다.')
    const res = await signup({ email, password })
    if (!res.ok) setError(res.error || '회원가입 실패')
    else {
      setMode('login')
      setPassword('')
      setConfirm('')
      setError('회원가입 완료! 로그인해주세요.')
    }
  }

  return (
    <div
      className={`auth-page ${dark ? 'dark' : ''}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: dark
          ? 'linear-gradient(135deg,#0f172a,#1e293b)'
          : 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
        transition: '0.3s ease-in-out',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 380,
          padding: '40px 36px',
          background: dark ? '#1e293b' : '#ffffff',
          borderRadius: 16,
          boxShadow: dark
            ? '0 6px 30px rgba(0,0,0,0.4)'
            : '0 6px 30px rgba(0,0,0,0.1)',
          color: dark ? '#f8fafc' : '#111827',
          position: 'relative',
        }}
      >
        {/* 다크모드 버튼 */}
        <button
          onClick={() => setDark(!dark)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {dark ? <Sun size={20} color="#facc15" /> : <Moon size={20} color="#2563eb" />}
        </button>

        {/* 로고 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: '800',
              color: dark ? '#60a5fa' : '#2563eb',
            }}
          >
            FocusFlow
          </h1>
          <p style={{ fontSize: 14, color: dark ? '#94a3b8' : '#6b7280' }}>
            집중의 흐름을 디자인하다 🧠
          </p>
        </div>

        {/* 제목 */}
        <h2 style={{ fontSize: 20, marginBottom: 16, textAlign: 'center' }}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '8px 12px',
              borderRadius: 8,
              marginBottom: 10,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '6px 10px',
                }}
              >
                <Mail size={16} style={{ marginRight: 8, color: '#64748b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 입력"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Password</label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '6px 10px',
                }}
              >
                <Lock size={16} style={{ marginRight: 8, color: '#64748b' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 8,
                background: '#2563eb',
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogIn size={16} style={{ marginRight: 6 }} /> 로그인
            </button>

            <p
              style={{
                textAlign: 'center',
                marginTop: 16,
                fontSize: 14,
                color: dark ? '#cbd5e1' : '#6b7280',
              }}
            >
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setError('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                }}
              >
                회원가입
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 입력"
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 14,
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 8,
                background: '#2563eb',
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={16} style={{ marginRight: 6 }} /> 회원가입
            </button>

            <p
              style={{
                textAlign: 'center',
                marginTop: 16,
                fontSize: 14,
                color: dark ? '#cbd5e1' : '#6b7280',
              }}
            >
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                }}
              >
                로그인
              </button>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  )
}

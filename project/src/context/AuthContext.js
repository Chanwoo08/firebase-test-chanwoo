import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth, firebaseSignup, firebaseLogin, firebaseLogout } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 인증 상태 구독
  useEffect(() => {
    const unsub = subscribeAuth((u) => {
      // user 객체에 uid와 email만 저장
      setUser(u ? { uid: u.uid, email: u.email } : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 회원가입
  async function signup({ email, password }) {
    try {
      await firebaseSignup(email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // 로그인
  async function login({ email, password }) {
    try {
      await firebaseLogin(email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // 로그아웃
  async function logout() {
    try {
      await firebaseLogout();
    } catch (e) {
      console.error(e);
    }
  }

  const value = { user, loading, signup, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
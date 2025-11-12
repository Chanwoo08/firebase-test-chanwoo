// src/App.js

import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MainPage1 from './pages/MainPage1';
import MainPageSubject from './pages/MainPageSubject'; 
import { useAuth } from './context/AuthContext';
import { StudyProvider } from './context/StudyContext'; 

// 인증이 필요한 라우트를 위한 보호 컴포넌트
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
      <div className="app-root">
        <Header />
        <main className="container">
          {/* StudyProvider로 Routes를 감싸서 전체 애플리케이션에서 공부 데이터 접근 가능하게 함 */}
          <StudyProvider> 
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* 보호된 라우트 */}
              {/* 메인 대시보드 */}
              <Route path="/main1" element={<Protected><MainPage1 /></Protected>} />
              
              {/* 과목 상세 페이지 라우트: ID를 파라미터로 받음 */}
              <Route 
                  path="/study/:subjectId" 
                  element={<Protected><MainPageSubject /></Protected>} 
              />
              
              {/* 매치되지 않는 라우트는 홈으로 리다이렉트 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </StudyProvider>
        </main>
        <Footer />
      </div>
  );
}
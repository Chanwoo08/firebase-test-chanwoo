import React from "react";
// Link 대신 useNavigate를 사용합니다.
import { Link, useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import { FaClock, FaBookOpen, FaChartPie } from "react-icons/fa";
// 💡 useAuth 훅을 가져와 로그인 상태를 확인합니다.
import { useAuth } from "../context/AuthContext"; 

// ***NOTE: 이 hook은 로그인 상태를 확인하는 사용자 정의 hook이라고 가정합니다.
// ❌ 실제 useAuth를 사용하므로 이 임시 훅은 주석 처리합니다.
/*
function useAuthStatus() {
  // 실제 구현에서는 전역 상태(Context, Redux 등) 또는 Firebase auth 객체를 확인합니다.
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setIsLoggedIn(!!user);
  //   });
  //   return unsubscribe;
  // }, []);
  
  // 로그인 상태가 아닐 때를 가정하여 임시로 false를 반환했습니다. 
  // 실제 앱에서는 사용자 로그인 상태에 따라 true/false를 반환해야 합니다.
  return false; 
}
*/


export default function LandingPage() {
  const navigate = useNavigate();
  // 💡 useAuth를 사용하여 사용자 로그인 상태를 가져옵니다.
  const { user } = useAuth();
  const isLoggedIn = !!user; // user 객체가 존재하면 로그인 상태입니다.

  // ⭐️ '지금 시작하기' 버튼과 헤더 버튼의 클릭 핸들러 함수
  const handleNavigation = (e) => {
    // <a> 태그의 기본 동작(페이지 이동)을 막습니다.
    e.preventDefault(); 
    
    // ⭐️ 로그인 상태에 따라 대시보드(/main1) 또는 로그인 페이지(/login)로 이동합니다.
    const destination = isLoggedIn ? "/main1" : "/login"; 
    navigate(destination);
  };

  const handleStartClick = handleNavigation;
  

  return (
    <div className="landing-container">
      {/* 헤더 */}
      <header className="landing-header">
        <h1 className="logo">📚 FocusFlow</h1>
        {/* ⭐️ '로그인 / 시작하기' 버튼 수정: Link 대신 a 태그 + onClick을 사용하여 로그인 상태에 따라 이동 */}
        <a 
          href={isLoggedIn ? "/main1" : "/login"} // href 경로를 /main1로 수정
          className="btn primary"
          onClick={handleNavigation} // 클릭 이벤트를 연결합니다.
        >
          {/* 로그인 상태에 따라 텍스트 변경 */}
          {isLoggedIn ? '대시보드로 이동' : '로그인 / 시작하기'}
        </a>
      </header>

      {/* 메인 히어로 섹션 */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="hero-title">
          “당신의 집중을 흐름으로 만들어드립니다.”
        </h2>
        <p className="hero-sub">
          FocusFlow는 효율적인 학습 타이머와 기록 관리로
          <br />
          당신의 공부 루틴을 한 단계 업그레이드해줍니다.
        </p>

        {/* ⭐️ '지금 시작하기 🚀' 버튼 수정 */}
        <a 
          href={isLoggedIn ? "/main1" : "/login"} // 대시보드 경로를 /main1로 수정
          className="btn hero-btn"
          onClick={handleStartClick} // 여기에 클릭 이벤트를 연결합니다.
        >
          {/* 로그인 상태에 따라 텍스트 변경 */}
          {isLoggedIn ? '대시보드로 이동 🚀' : '지금 시작하기 🚀'}
        </a>
      </motion.section>

      {/* 기능 소개 섹션 */}
      <motion.section
        className="features"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="section-title">✨ 핵심 기능</h3>

        <div className="feature-grid">
          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaClock size={40} color="#2563eb" />
            <h4>스마트 타이머</h4>
            <p>25분 집중 + 5분 휴식, 포모도로 기반 학습 사이클</p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaBookOpen size={40} color="#22c55e" />
            <h4>공부 기록 관리</h4>
            <p>과목별 공부 시간과 메모를 한눈에 관리하세요.</p>
          </motion.div>

          <motion.div
            className="feature-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <FaChartPie size={40} color="#f97316" />
            <h4>학습 통계 시각화</h4>
            <p>차트로 나의 공부 패턴을 분석하고 효율을 높입니다.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* 푸터 */}
      <footer className="landing-footer">
        <p>© 2025 FocusFlow. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
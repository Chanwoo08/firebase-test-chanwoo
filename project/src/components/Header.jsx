import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Moon,
  Sun,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Firestore 연결
// 💡 AuthContext에서 useAuth를 가져옵니다.
import { useAuth } from "../context/AuthContext"; 
import "./Header.css";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  // 💡 user 객체와 logout 함수를 useAuth에서 가져옵니다.
  const { user, logout } = useAuth(); 
  
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");
  // 💡 userName을 user.email에서 가져오거나, 로그인 상태가 아닐 때 처리합니다.
  // const [userName] = useState("Focus User"); 
  const userName = user?.email || "Guest User"; 
  
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef();

  // 테마 적용
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 Firestore에서 알림 가져오기 (실시간)
  useEffect(() => {
    // 💡 로그인이 되어 있을 때만 알림을 구독합니다.
    if (!user) return; 

    const notifCollection = collection(db, "notifications");
    const unsubscribe = onSnapshot(notifCollection, (snapshot) => {
      const notifData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifData);
    });

    return () => unsubscribe();
  }, [user]); // user가 변경될 때마다 구독을 다시 설정합니다.

  // ⭐️ 로그아웃 기능 수정
  const handleLogout = async () => {
    // 로컬 스토리지 제거 대신 useAuth의 logout 함수를 호출합니다.
    await logout(); 
    // 로그아웃 후 홈 화면으로 이동하여 '지금 시작하기' 버튼이 보이도록 합니다.
    navigate("/"); 
  };

  const navItems = [
    { name: "Home", icon: <Home size={16} />, path: "/" },
    // 💡 로그인 상태일 때만 Dashboard가 필요합니다.
    { name: "Dashboard", icon: <LayoutDashboard size={16} />, path: "/main1" }, 
  ];

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          Focus<span>Flow</span>
        </Link>

        <nav className="nav">
          {/* 💡 로그인 되어 있을 때만 Dashboard를 표시하도록 조건부 렌더링 */}
          {navItems
            .filter(item => item.path === "/" || user)
            .map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* 중앙 검색창 */}
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="과목, 메모, 기능 검색..."
        />
      </div>

      {/* 💡 로그인 되어 있을 때만 우측 아이콘들을 표시하도록 조건부 렌더링 */}
      {user ? (
        <div className="header-right" ref={dropdownRef}>
          {/* 테마 전환 */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="icon-btn"
            title="테마 변경"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* 알림 */}
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="icon-btn"
            title="알림"
          >
            <Bell size={18} />
          </button>

          {notifOpen && (
            <div className="dropdown notif-dropdown">
              <h4>📢 알림</h4>
              {notifications.length === 0 ? (
                <p className="muted">새로운 알림이 없습니다.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="notif-item">
                    {n.text}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 프로필 */}
          <div className="profile-wrap">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="profile-btn"
            >
              {/* 이메일 앞부분을 시드로 사용하여 아바타 생성 */}
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName.split('@')[0]}`} 
                alt="avatar"
                className="avatar"
              />
              {/* 💡 이메일의 로컬 파트만 표시 */}
              <span className="username">{userName.split('@')[0]}</span> 
            </button>

            {dropdownOpen && (
              <div className="dropdown">
                <Link to="/main1" className="dropdown-item">
                  <LayoutDashboard size={14} /> 내 대시보드
                </Link>
                {/* ⭐️ 수정된 로그아웃 버튼 */}
                <button onClick={handleLogout} className="dropdown-item logout">
                  <LogOut size={14} /> 로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 로그아웃 상태일 때 로그인 버튼 표시
        <Link to="/login" className="btn primary" style={{ marginLeft: 'auto' }}>
            로그인 / 시작하기
        </Link>
      )}
    </header>
  );
}
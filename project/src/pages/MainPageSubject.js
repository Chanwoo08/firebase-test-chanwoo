import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { motion } from "framer-motion";
import {
  Clock, BookOpen, ArrowLeft, Trash2, Edit3, Plus, Minus, Target, Save, AlertTriangle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useStudy } from "../context/StudyContext"; 

export default function MainPageSubject() {
    const navigate = useNavigate();
    // 💡 studyData, updateTime, updateMemo, setGoal, loading, getWeeklyData를 StudyContext에서 가져옴
    const { studyData, updateTime, updateMemo, setGoal, loading, getWeeklyData } = useStudy(); 
    const { subjectId } = useParams(); 

    // ⭐️ 로컬 상태
    const [memo, setMemo] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [savedMemos, setSavedMemos] = useState([]); 
    const [minutes, setMinutes] = useState(25); // 타이머 설정 시간
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 남은 시간 (초)
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("study"); 
    
    // 💡 변경: DB에서 로드된 목표 시간 (최종)
    const [goal, setGoalSetting] = useState(60); 
    // 💡 추가: 사용자가 +/-로 변경하는 임시 목표 시간
    const [tempGoal, setTempGoal] = useState(60); 
    
    const [darkMode, setDarkMode] = useState(document.body.className === 'dark'); 
    // 💡 누적 공부 시간 (DB에서 로드)
    const [currentTime, setCurrentTime] = useState(0); 

    const timerRef = useRef(null);
    const memoInputRef = useRef(null);
  
    const currentSubjectData = studyData?.subjects.find(s => s.id === subjectId); 
    const studyRecords = studyData?.studyRecords || {};

    // ⭐️ 데이터 동기화 (DB -> 로컬 상태)
    useEffect(() => {
        if (currentSubjectData) {
            setSavedMemos(currentSubjectData.memo || []);
            // 2. 목표 달성 현황: 누적 시간과 목표 시간 로드
            const loadedTime = currentSubjectData.time || 0;
            const loadedGoal = currentSubjectData.goal || 60;
            setCurrentTime(loadedTime); 
            setGoalSetting(loadedGoal);
            setTempGoal(loadedGoal); // 임시 상태도 DB 값으로 초기화
        }
        setDarkMode(document.body.className === 'dark');
    }, [subjectId, currentSubjectData, studyData]); 

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', fontSize: '1.2rem' }}>데이터 로드 중...</div>;
    }
    
    if (!currentSubjectData) {
        // (과목 없음 처리 로직은 생략)
        // ...
        return (
            <div style={{ padding: 40, textAlign: 'center', fontSize: '1.2rem' }}>
                <AlertTriangle size={30} color="red" style={{ marginBottom: 15 }} />
                <p>죄송합니다. 요청하신 과목을 찾을 수 없습니다.</p>
            </div>
        );
    }
    
    const displayName = currentSubjectData.displayName || currentSubjectData.name;
    const subjectColor = currentSubjectData.color || '#3b82f6';
    const cardBg = darkMode ? "#1f2937" : "white";
    const textColor = darkMode ? "#f3f4f6" : "#1f2937";
    const subTextColor = darkMode ? "#9ca3af" : "#6b7280";

    // ----------------------------------------------------
    // 1. 집중 시간 (타이머) 로직 - DB 기록 포함
    // ----------------------------------------------------
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current);
                        setIsRunning(false);
                        handleTimerEnd(); // 💡 타이머 종료 시 기록 및 모드 전환
                        return 0;
                    }
                    return prevTime - 1; // 1초씩 감소
                });
            }, 1000);
        }
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
        setIsRunning(false);
    };

    const handleTimerEnd = () => {
        if (mode === 'study') {
            const minutesCompleted = minutes; // 설정된 분만큼 완료
            
            // ⭐️ DB에 누적 시간과 일별 기록을 기록
            // 💡 updateTime 함수를 호출하여 DB 업데이트를 수행합니다.
            updateTime(subjectId, minutesCompleted); 
            
            // 로컬 상태 업데이트
            setCurrentTime(prevTime => prevTime + minutesCompleted); 
            
            // 모드 전환: 공부 -> 휴식 (5분)
            setMode('break');
            setMinutes(5); 
            setTimeLeft(5 * 60);
        } else {
            // 휴식 종료: 휴식 -> 공부 (25분)
            setMode('study');
            setMinutes(25); 
            setTimeLeft(25 * 60);
        }
    };
    
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const handleTimeChange = (change) => {
        if (!isRunning) {
            const newMinutes = Math.max(5, minutes + change);
            setMinutes(newMinutes);
            setTimeLeft(newMinutes * 60);
        }
    };

    // ----------------------------------------------------
    // 2. 목표 달성 현황 로직 ('설정하기' 버튼 추가)
    // ----------------------------------------------------
    const handleTempGoalChange = (change) => {
        const newGoal = Math.max(30, tempGoal + change); // 최소 목표 30분
        setTempGoal(newGoal);
    }
    
    // 💡 변경: '설정하기' 버튼을 눌렀을 때만 실행되는 함수
    const handleSaveGoal = () => {
        // 로컬 상태(goal)를 임시 상태(tempGoal)로 업데이트
        setGoalSetting(tempGoal);
        // ⭐️ DB에 일일 목표 시간(goal)을 저장
        setGoal(subjectId, tempGoal); 
        alert(`${tempGoal}분으로 목표 시간이 설정되었습니다.`);
    }

    const goalAchievedPercent = Math.min(100, (currentTime / goal) * 100);

    // ----------------------------------------------------
    // 3. 주간 공부량 (차트) 데이터
    // ----------------------------------------------------
    const weekData = getWeeklyData(studyRecords, subjectId); 
    
    // ----------------------------------------------------
    // 🧠 메모 관리 로직 (DB 업데이트 함수 포함)
    // ----------------------------------------------------
    const handleAddMemo = () => {
        if (memo.trim()) {
            const newMemos = [...savedMemos, memo.trim()];
            setSavedMemos(newMemos);
            // 💡 메모 DB 업데이트
            updateMemo(subjectId, newMemos); 
            setMemo("");
            setEditingIndex(null);
        }
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null && memo.trim()) {
            const newMemos = savedMemos.map((m, i) => 
                i === editingIndex ? memo.trim() : m
            );
            setSavedMemos(newMemos);
            // 💡 메모 DB 업데이트
            updateMemo(subjectId, newMemos); 
            setMemo("");
            setEditingIndex(null);
        }
    };

    const handleDeleteMemo = (index) => {
        const newMemos = savedMemos.filter((_, i) => i !== index);
        setSavedMemos(newMemos);
        // 💡 메모 DB 업데이트
        updateMemo(subjectId, newMemos); 
    };
    
    // (handleEditMemo 등 기타 메모 로직은 생략)

    return (
        <div style={{ 
            padding: '0 20px', maxWidth: 900, margin: '0 auto', color: textColor 
        }}>
            {/* 헤더 및 뒤로가기 버튼 */}
            <div style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                margin: '40px 0 30px' 
            }}>
                <motion.button
                    onClick={() => navigate('/main1')}
                    // ... (스타일 생략)
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: 5, 
                        background: 'none', border: 'none', cursor: 'pointer', 
                        color: subTextColor, fontWeight: 500 
                    }}
                >
                    <ArrowLeft size={20} color={subTextColor} /> 대시보드
                </motion.button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: subjectColor }}>
                    <BookOpen size={30} style={{ marginRight: 10, verticalAlign: 'middle' }} /> 
                    {displayName}
                </h1>
                <div style={{ width: 80 }}></div>
            </div>

            {/* 타이머 및 목표 섹션 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                
                {/* ⏰ 집중 시간 (타이머) - 1번 요구 사항 */}
                <motion.div
                    // ... (애니메이션 스타일 생략)
                    style={{
                        background: cardBg,
                        borderRadius: 16,
                        padding: 30,
                        textAlign: 'center',
                        boxShadow: darkMode
                            ? "0 0 15px rgba(56,189,248,0.3)"
                            : "0 4px 10px rgba(0,0,0,0.1)",
                        border: `2px solid ${mode === 'study' ? '#2563eb' : '#f59e0b'}`
                    }}
                >
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 15, color: mode === 'study' ? '#2563eb' : '#f59e0b' }}>
                        {mode === 'study' ? '집중 시간 📚' : '휴식 시간 ☕'}
                    </h3>

                    {/* 시간 설정 버튼 */}
                    {/* ... (시간 설정 버튼 로직 생략) */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                        <motion.button
                            onClick={() => handleTimeChange(-5)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isRunning}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }}
                        >
                            <Minus size={24} color={subTextColor} />
                        </motion.button>
                        <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>{minutes} 분</span>
                        <motion.button
                            onClick={() => handleTimeChange(5)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={isRunning}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }}
                        >
                            <Plus size={24} color={subTextColor} />
                        </motion.button>
                    </div>

                    {/* 카운트다운 */}
                    <div style={{ fontSize: '4rem', fontWeight: 900, margin: '20px 0', color: subjectColor }}>
                        {formatTime(timeLeft)}
                    </div>

                    {/* 타이머 컨트롤 버튼 */}
                    {/* ... (타이머 컨트롤 버튼 로직 생략) */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                        <motion.button
                            onClick={isRunning ? stopTimer : startTimer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '12px 25px', borderRadius: 8, border: 'none', 
                                background: isRunning ? '#ef4444' : '#10b981', 
                                color: 'white', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            {isRunning ? '일시 정지' : '시작'}
                        </motion.button>
                        <motion.button
                            onClick={() => { stopTimer(); setTimeLeft(minutes * 60); setIsRunning(false); }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '12px 25px', borderRadius: 8, border: '1px solid #d1d5db', 
                                background: 'transparent', color: subTextColor, fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            초기화
                        </motion.button>
                    </div>
                </motion.div>

                {/* 🎯 목표 달성 현황 - 2번 요구 사항 (설정 버튼 추가) */}
                <motion.div
                    // ... (애니메이션 스타일 생략)
                    style={{
                        background: cardBg,
                        borderRadius: 16,
                        padding: 30,
                        boxShadow: darkMode
                            ? "0 0 15px rgba(56,189,248,0.3)"
                            : "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 20 }}>
                        <Target size={24} style={{ verticalAlign: 'middle', marginRight: 10 }} /> 
                        목표 달성 현황
                    </h3>

                    {/* 일일 목표 시간 설정 (+/- 및 설정 버튼) */}
                    <div style={{ marginBottom: 20, paddingBottom: 15, borderBottom: `1px solid ${subTextColor}30` }}>
                        <span style={{ fontWeight: 500, display: 'block', marginBottom: 10 }}>일일 목표 시간 설정:</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <motion.button
                                    onClick={() => handleTempGoalChange(-30)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }}
                                >
                                    <Minus size={20} color={subTextColor} />
                                </motion.button>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: subjectColor }}>
                                    {tempGoal} 분
                                </span>
                                <motion.button
                                    onClick={() => handleTempGoalChange(30)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }}
                                >
                                    <Plus size={20} color={subTextColor} />
                                </motion.button>
                            </div>
                            
                            {/* 💡 저장 버튼 추가 */}
                            <motion.button
                                onClick={handleSaveGoal} // 설정하기 버튼 클릭 시 DB 저장 함수 호출
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '8px 15px', borderRadius: 8, border: 'none',
                                    background: '#2563eb', color: 'white', fontWeight: 600, 
                                    cursor: 'pointer'
                                }}
                            >
                                <Save size={16} /> 설정하기
                            </motion.button>
                        </div>
                        {goal !== tempGoal && (
                            <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: 10 }}>
                                * 목표: {goal}분. 위의 시간({tempGoal}분)으로 설정하려면 '설정하기'를 눌러주세요.
                            </p>
                        )}
                    </div>


                    {/* 누적 시간 (집중 시간에서 기록된 시간) */}
                    <div style={{ marginBottom: 30 }}>
                        <span style={{ fontWeight: 500, display: 'block', marginBottom: 5 }}>누적 공부 시간:</span>
                        <span style={{ fontSize: '2rem', fontWeight: 800 }}>
                            {Math.floor(currentTime / 60)} 시간 {currentTime % 60} 분
                        </span>
                    </div>

                    {/* 달성률 프로그레스바 */}
                    <div style={{ position: 'relative', height: 10, background: '#e5e7eb', borderRadius: 5 }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goalAchievedPercent}%` }}
                            transition={{ duration: 0.8 }}
                            style={{ 
                                height: '100%', borderRadius: 5, 
                                background: goalAchievedPercent >= 100 ? '#10b981' : subjectColor 
                            }}
                        />
                        <span 
                            style={{ 
                                position: 'absolute', top: -30, right: 0, 
                                fontSize: '0.9rem', fontWeight: 600, 
                                color: goalAchievedPercent >= 100 ? '#10b981' : subTextColor
                            }}
                        >
                            {goalAchievedPercent.toFixed(1)}% 달성
                        </span>
                    </div>

                    {goalAchievedPercent >= 100 && (
                        <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            style={{ color: '#10b981', marginTop: 15, fontWeight: 600 }}
                        >
                            🎉 목표를 초과 달성했습니다. 멋져요!
                        </motion.p>
                    )}
                </motion.div>
            </div>


            {/* 메모 및 통계 섹션 */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 30 
            }}>
                {/* 📝 학습 노트 (DB 연동) - 메모 로직은 변경 없음 */}
                <motion.div
                    // ... (스타일 생략)
                    style={{
                        background: cardBg,
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: darkMode
                            ? "0 0 15px rgba(56,189,248,0.3)"
                            : "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 15 }}>
                        📝 학습 노트
                    </h3>
                    
                    {/* 메모 입력 및 저장/수정 버튼 */}
                    {/* ... (메모 입력 필드 및 버튼 로직 생략) */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                        <input
                            ref={memoInputRef}
                            type="text"
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    editingIndex !== null ? handleSaveEdit() : handleAddMemo();
                                }
                            }}
                            placeholder={editingIndex !== null ? "메모 수정..." : "오늘의 학습 내용/할 일"}
                            style={{
                                flexGrow: 1, padding: "10px 12px", borderRadius: 8,
                                border: "1px solid #d1d5db", background: darkMode ? "#374151" : "#f9fafb",
                                color: textColor 
                            }}
                        />
                        <motion.button
                            onClick={editingIndex !== null ? handleSaveEdit : handleAddMemo}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: "10px 15px", borderRadius: 8, background: subjectColor,
                                color: "black", border: "none", cursor: "pointer", fontWeight: 600
                            }}
                        >
                            {editingIndex !== null ? "저장" : "추가"}
                        </motion.button>
                    </div>

                    {/* 저장된 메모 목록 */}
                    {/* ... (메모 목록 로직 생략) */}
                    <motion.div layout style={{ maxHeight: 250, overflowY: 'auto' }}>
                        {savedMemos.length === 0 ? (
                            <p style={{ color: subTextColor, textAlign: 'center', padding: 20, border: '1px dashed #e5e7eb', borderRadius: 8 }}>
                                저장된 학습 노트가 없습니다.
                            </p>
                        ) : (
                            savedMemos.map((m, i) => (
                                <motion.div
                                    key={i}
                                    layout
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "10px 12px", marginBottom: 8, background: darkMode ? "#374151" : "#f3f4f6",
                                        borderRadius: 8, fontSize: '0.95rem', borderLeft: `3px solid ${subjectColor}`
                                    }}
                                >
                                    <span style={{ flexGrow: 1, color: editingIndex === i ? '#f59e0b' : textColor }}>
                                        {m}
                                    </span>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <motion.button 
                                            onClick={() => setEditingIndex(i)} // handleEditMemo 대체
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: subTextColor }}
                                        >
                                            <Edit3 size={16} color={subTextColor} />
                                        </motion.button>
                                        <motion.button 
                                            onClick={() => handleDeleteMemo(i)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                        >
                                            <Trash2 size={16} color="#ef4444" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </motion.div>

                {/* 3. 주간 공부량 (통계) - 3번 요구 사항 */}
                <motion.div
                    // ... (스타일 생략)
                    style={{
                        background: cardBg,
                        borderRadius: 16,
                        padding: 20,
                        boxShadow: darkMode
                            ? "0 0 15px rgba(56,189,248,0.3)"
                            : "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 15 }}>
                        📈 주간 공부량 (분)
                    </h3>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekData} margin={{ top: 10, right: 0, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#4b5563" : "#e5e7eb"} />
                                <XAxis dataKey="day" stroke={textColor} />
                                <YAxis stroke={textColor} />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: cardBg, 
                                        border: `1px solid ${darkMode ? "#4b5563" : "#d1e5db"}`,
                                        color: textColor
                                    }}
                                    labelStyle={{ color: subjectColor }}
                                    formatter={(value) => [`${value} 분`, '공부 시간']} 
                                />
                                <Bar dataKey="시간" fill={subjectColor} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
            
        </div>
    );
}
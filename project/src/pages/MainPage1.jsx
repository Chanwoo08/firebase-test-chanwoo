import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    BookOpen, Clock, Target, StickyNote, Sun, Moon, Search, Plus, X 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStudy } from "../context/StudyContext"; 
import { v4 as uuidv4 } from 'uuid'; // 고유 ID 생성을 위해 uuid 라이브러리 가정 (실제 프로젝트에선 설치 필요)

// ------------------------------------------
// Study Data를 Context에서 가져옴
// ------------------------------------------
const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
const cardTextColor = '#1f2937'; 

// Subject 추가/수정 모달 컴포넌트 (생략 - 변경 없음)
function SubjectModal({ isOpen, onClose, onSave }) {
    // ... (SubjectModal content is unchanged)
    const [name, setName] = useState('');
    const [color, setColor] = useState(colors[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ 
                name: name.trim(), 
                displayName: name.trim(), 
                color: color, 
                id: uuidv4(), 
                time: 0, // 'totalTime' 대신 'time' 사용 (StudyContext의 updateTime 로직에 맞춤)
                memo: [], 
                goal: 60, 
            });
            setName('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        // ... (Modal JSX remains the same)
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            zIndex: 1000
        }}>
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{ 
                    backgroundColor: 'white', 
                    padding: 30, 
                    borderRadius: 16, 
                    width: '90%', maxWidth: 400, 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>새 과목 추가</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#6b7280" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>과목 이름</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="예: 미적분학, 영어 회화"
                        required
                        style={{ 
                            width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', 
                            borderRadius: 8, marginBottom: 20
                        }}
                    />

                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>색상 선택</label>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
                        {colors.map((c) => (
                            <div
                                key={c}
                                onClick={() => setColor(c)}
                                style={{
                                    backgroundColor: c,
                                    width: 30,
                                    height: 30,
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    border: color === c ? '3px solid #374151' : '1px solid #d1d5db',
                                    transition: 'border 0.2s'
                                }}
                            ></div>
                        ))}
                    </div>

                    <button 
                        type="submit"
                        style={{
                            width: '100%', padding: '10px 0', borderRadius: 8, 
                            background: color, color: 'white', fontWeight: 600, 
                            border: 'none', cursor: 'pointer', transition: 'background 0.2s'
                        }}
                    >
                        과목 추가
                    </button>
                </form>
            </motion.div>
        </div>
    );
}


export default function MainPage1() {
    const navigate = useNavigate();
    const { user } = useAuth();
    // 💡 수정 1: addSubject 함수를 useStudy()에서 가져옵니다.
    const { subjects, loading, fetchStudyData, studyData, addSubject } = useStudy(); 
    const [isModalOpen, setIsModalOpen] = useState(false);

    // useCallback은 사용되지 않으므로 제거합니다.
    // const updateSubjectsList = useCallback((newSubjects) => {
    //     if (!user) return;
    //     fetchStudyData(); 
    // }, [user, fetchStudyData]);

    // 💡 수정 2: Context의 addSubject 함수를 호출하여 DB에 저장하도록 로직을 수정합니다.
    const handleAddSubject = (newSubject) => {
        if (!user || !studyData) return;
        
        console.log("Attempting to add subject via Context:", newSubject.name);
        
        // ⭐️ Context의 addSubject 함수를 호출합니다. 이 함수가 DB 업데이트와 상태 동기화를 담당합니다.
        addSubject(newSubject); 
        
        // 기존의 불필요했던 fetchStudyData() 호출을 제거합니다.
    };

    // 통계 계산 (총 공부 시간)
    const totalMinutes = useMemo(() => {
        // 'totalTime'이 아닌 'time' 속성을 사용하도록 수정 (StudyContext의 updateTime 로직에 맞춤)
        return subjects.reduce((sum, subj) => sum + (subj.time || 0), 0);
    }, [subjects]);

    const totalHours = (totalMinutes / 60).toFixed(1);

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center', fontSize: '1.2rem' }}>공부 데이터를 로드 중입니다...</div>;
    }

    return (
        <div style={{ padding: '0 20px', maxWidth: 1000, margin: '0 auto' }}>
            {/* ... (나머지 JSX는 동일) ... */}

            {/* 제목 및 환영 메시지 */}
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '40px 0 20px' }}>
                👋 FocusFlow 대시보드
            </h1>
            <p style={{ color: '#6b7280', marginBottom: 40, fontSize: '1.1rem' }}>
                오늘도 집중할 과목을 선택하고 목표를 향해 나아가세요.
            </p>

            {/* 요약 카드 섹션 */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 20, marginBottom: 50 
            }}>
                <SummaryCard icon={Clock} label="총 공부 시간" value={`${totalHours} 시간`} dark={false} />
                <SummaryCard icon={Target} label="등록된 과목 수" value={`${subjects.length} 개`} dark={false} />
                <SummaryCard icon={StickyNote} label="평균 집중 시간" value="25 분" dark={false} />
            </div>

            {/* 과목 목록 섹션 */}
            <div style={{ marginBottom: 50 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 600 }}>📝 나의 과목</h2>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: 5, 
                            padding: '10px 20px', borderRadius: 8, 
                            background: '#2563eb', color: 'white', border: 'none', 
                            cursor: 'pointer', fontWeight: 600 
                        }}
                    >
                        <Plus size={20} /> 새 과목 추가
                    </motion.button>
                </div>
                
                {subjects.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#6b7280', padding: 40, border: '1px dashed #d1d5db', borderRadius: 12 }}>
                        아직 등록된 과목이 없습니다. '새 과목 추가' 버튼을 눌러 첫 과목을 등록해보세요!
                    </p>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 20,
                        margin: "0 auto",
                    }}
                >
                    {/* Firestore에서 로드된 subjects를 매핑 */}
                    {subjects.map((subj, i) => (
                        <motion.div
                            key={subj.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: subj.color,
                                padding: 20,
                                borderRadius: 16,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                color: cardTextColor 
                            }}
                            onClick={() => navigate(`/study/${subj.id}`)} 
                        >
                            <BookOpen size={40} color={cardTextColor} /> 
                            <h3 style={{ marginTop: 10, fontSize: 20, fontWeight: 700 }}>{subj.displayName || subj.name}</h3>
                            {/* 'totalTime' 대신 'time' 사용 */}
                            <p style={{ marginTop: 5, opacity: 0.8 }}>총 {((subj.time || 0) / 60).toFixed(1)} 시간 공부</p>
                            <p style={{ marginTop: 10, fontWeight: 500 }}>공부하러 가기 →</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 모달 */}
            <SubjectModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleAddSubject} 
            />
        </div>
    );
}

// 요약 카드 컴포넌트 (생략 - 변경 없음)
function SummaryCard({ icon: Icon, label, value, dark }) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            style={{
                background: dark ? "#374151" : "white",
                borderRadius: 16,
                padding: "20px",
                boxShadow: dark ? "0 0 15px rgba(56,189,248,0.3)" : "0 4px 10px rgba(0,0,0,0.1)",
                color: dark ? "white" : "#1f2937",
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}
        >
            <div style={{ color: '#2563eb', marginBottom: 10 }}>
                <Icon size={28} />
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 500, marginBottom: 5 }}>{label}</p>
            <h4 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</h4>
        </motion.div>
    );
}
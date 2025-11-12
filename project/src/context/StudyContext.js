import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// 🚨 AuthContext는 별도로 구현되었다고 가정합니다.
import { useAuth } from './AuthContext'; 
import { getStudyData, updateSubjects, updateStudyData, addSubject as addSubjectFirebase } from '../firebase'; 

const StudyContext = createContext(null);

export function useStudy() {
  return useContext(StudyContext);
}

export function StudyProvider({ children }) {
  const { user } = useAuth(); // 사용자 인증 정보
  const [studyData, setStudyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📝 데이터 불러오기
  const fetchStudyData = useCallback(async () => {
    if (!user) {
      setStudyData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getStudyData(user.uid);
      if (!data.studyRecords) data.studyRecords = {}; 
      setStudyData(data);
    } catch (e) {
      console.error("Failed to fetch study data:", e);
      setError(e);
      setStudyData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudyData();
  }, [fetchStudyData]);
  
  // ------------------------------------------------------------------
  // 1. 집중 시간 기록 (누적 시간 및 일별 기록 DB 업데이트)
  // ------------------------------------------------------------------
  const updateTime = useCallback(async (subjectId, minutesToAdd) => {
    if (!user || !studyData) return;

    // 현재 날짜를 'YYYY-MM-DD' 형식으로 구합니다.
    const today = new Date().toISOString().split('T')[0]; 
    let updatedStudyRecords = { ...studyData.studyRecords };
    
    // 1. 일별 기록 (주간 차트용) 업데이트
    if (!updatedStudyRecords[today]) {
        updatedStudyRecords[today] = {};
    }
    const currentDailyTime = updatedStudyRecords[today][subjectId] || 0;
    updatedStudyRecords[today][subjectId] = currentDailyTime + minutesToAdd;
    
    // 2. 총 누적 시간 업데이트
    const updatedSubjects = studyData.subjects.map(s => {
      if (s.id === subjectId) { 
        const currentTotalTime = s.time || 0;
        return {
          ...s,
          time: currentTotalTime + minutesToAdd
        };
      }
      return s;
    });

    try {
      // 3. Firestore 업데이트
      await updateSubjects(user.uid, updatedSubjects);
      await updateStudyData(user.uid, { studyRecords: updatedStudyRecords }); 
      
      // 4. 클라이언트 상태 업데이트
      setStudyData(prevData => ({
        ...prevData,
        subjects: updatedSubjects,
        studyRecords: updatedStudyRecords 
      }));
    } catch (e) {
      console.error("Failed to update time/records:", e);
    }
  }, [user, studyData]);

  // ------------------------------------------------------------------
  // 🎯 목표 업데이트 (DB 저장)
  // ------------------------------------------------------------------
  const setGoal = useCallback(async (subjectId, newGoal) => {
    if (!user || !studyData) return;

    const updatedSubjects = studyData.subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, goal: newGoal };
      }
      return s;
    });

    try {
      await updateSubjects(user.uid, updatedSubjects);
      setStudyData(prevData => ({
        ...prevData,
        subjects: updatedSubjects
      }));
    } catch (e) {
      console.error("Failed to update goal:", e);
    }
  }, [user, studyData]);

  // ------------------------------------------------------------------
  // 🧠 메모 업데이트 (DB 저장)
  // ------------------------------------------------------------------
  const updateMemo = useCallback(async (subjectId, newMemos) => {
    if (!user || !studyData) return;

    const updatedSubjects = studyData.subjects.map(s => {
      if (s.id === subjectId) {
        return { ...s, memo: newMemos };
      }
      return s;
    });

    try {
      await updateSubjects(user.uid, updatedSubjects);
      setStudyData(prevData => ({
        ...prevData,
        subjects: updatedSubjects
      }));
    } catch (e) {
      console.error("Failed to update memo:", e);
    }
  }, [user, studyData]);

  // ------------------------------------------------------------------
  // ➕ 새 과목 추가 (DB 저장)
  // ------------------------------------------------------------------
  const addSubject = useCallback(async (newSubject) => {
    // ⚠️ 이곳에서 user가 null이면 Firestore 호출이 차단됩니다.
    if (!user || !studyData) { 
        console.error("Firestore Error: User is not authenticated or study data is not loaded.");
        return null;
    }

    try {
        const updatedSubjects = await addSubjectFirebase(user.uid, newSubject, studyData.subjects); 
        
        // 클라이언트 상태 업데이트
        setStudyData(prevData => ({
            ...prevData,
            subjects: updatedSubjects
        }));
        
        return updatedSubjects;

    } catch (e) {
        console.error("Failed to add new subject to Firestore:", e);
        // 오류 처리
        return null;
    }
  }, [user, studyData]);

  // ------------------------------------------------------------------
  // 3. 주간 공부량 데이터 가공 (차트용)
  // ------------------------------------------------------------------
  const getWeeklyData = useCallback((studyRecords, subjectId) => {
    const today = new Date();
    // 현재 주의 일요일(0)을 시작일로 설정
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); 

    const weeklyData = [];
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        const dailyRecord = studyRecords[dateKey] || {};
        const timeInMinutes = dailyRecord[subjectId] || 0; 

        weeklyData.push({
            day: days[i], // X축: 요일
            시간: timeInMinutes // Y축: 공부 시간 (분)
        });
    }
    return weeklyData;
  }, []); 

  const subjects = studyData?.subjects || [];

  const value = {
    studyData: studyData,
    subjects: subjects,   
    loading,
    error,
    fetchStudyData,
    updateTime, 
    updateMemo,
    setGoal,    
    getWeeklyData, 
    addSubject, 
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
}
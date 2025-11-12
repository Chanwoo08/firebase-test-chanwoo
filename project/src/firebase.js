import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  // collection, query, where, getDocs, // 현재 사용하지 않아 주석 처리
  updateDoc
} from 'firebase/firestore'

// 🚨 firebaseConfig는 프로젝트 설정에 따라 외부 파일에서 가져와야 합니다.
import { firebaseConfig } from './firebaseConfig'

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app);

// ------------------------------------------
// 🔑 인증 관련 함수 (AuthContext.js에 필요)
// ------------------------------------------
export function subscribeAuth(fn) {
  return onAuthStateChanged(auth, fn)
}

export function firebaseSignup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function firebaseLogin(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function firebaseLogout() {
  return signOut(auth)
}

// ------------------------------------------
// 🔥 Firestore 데이터 관리 함수 (StudyContext.js에 필요)
// ------------------------------------------

/**
 * 사용자 ID를 기반으로 Firestore에서 공부 데이터를 가져옵니다.
 */
export async function getStudyData(userId) {
  if (!userId) return null;
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    if (!data.subjects) data.subjects = [];
    if (!data.studyRecords) data.studyRecords = {}; 
    return data;
  } else {
    // 문서가 없으면 빈 초기 데이터 생성
    const initialData = {
      subjects: [], 
      studyRecords: {}
    };
    await setDoc(docRef, initialData);
    return initialData;
  }
}

/**
 * 과목 리스트(subjects)를 업데이트합니다. (누적 시간, 목표, 메모 포함)
 */
export async function updateSubjects(userId, subjects) {
  if (!userId) throw new Error("User ID is required.");
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, { subjects });
}

/**
 * studyRecords와 같은 사용자 문서의 임의의 필드를 업데이트하는 범용 함수
 */
export async function updateStudyData(userId, updateData) {
  if (!userId) throw new Error("User ID is required.");
  const docRef = doc(db, "users", userId);
  await updateDoc(docRef, updateData);
}

/**
 * 새로운 과목을 추가하고 Firestore에 반영합니다.
 */
export async function addSubject(userId, newSubject, currentSubjects) {
  if (!userId) throw new Error("User ID is required.");
  // ⭐️ 현재 과목 리스트에 새 과목을 추가
  const updatedSubjects = [...currentSubjects, newSubject];
  const docRef = doc(db, "users", userId);
  // ⭐️ Firestore updateDoc 호출
  await updateDoc(docRef, { subjects: updatedSubjects }); 
  return updatedSubjects;
}
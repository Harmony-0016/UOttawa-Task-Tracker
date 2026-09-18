import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { TaskItem } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class FirestoreService {
  static getTasksCollectionPath() {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");
    return `users/${userId}/tasks`;
  }

  static subscribeToTasks(callback: (tasks: TaskItem[]) => void) {
    try {
      const path = this.getTasksCollectionPath();
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      
      return onSnapshot(q, (snapshot) => {
        const tasks: TaskItem[] = [];
        snapshot.forEach((doc) => {
          tasks.push({ id: doc.id, ...doc.data() } as TaskItem);
        });
        callback(tasks);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    } catch (e) {
      console.warn("Could not subscribe:", e);
      return () => {};
    }
  }

  static async saveTask(task: TaskItem) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const path = `users/${userId}/tasks`;
    try {
      const taskRef = doc(db, path, task.id);
      
      // Firestore does not support 'undefined' values. We must sanitize them out.
      // A quick way is JSON stringify/parse, or looping through keys.
      const sanitizedTask = JSON.parse(JSON.stringify(task));
      const payload = { ...sanitizedTask, userId }; // Ensure userId is attached for rules
      
      await setDoc(taskRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  static async deleteTask(taskId: string) {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    
    const path = `users/${userId}/tasks`;
    try {
      const taskRef = doc(db, path, taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

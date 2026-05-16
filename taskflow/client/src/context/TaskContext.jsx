import { createContext, useContext } from 'react';
import { useTasksState } from '../hooks/useTasks.js';

export const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const value = useTasksState();
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export default function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}

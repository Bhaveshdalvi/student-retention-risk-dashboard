import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStudents } from "@/services/api";
import { students as mockStudents, type Student } from "@/data/mockStudents";

interface StudentsContextType {
  students: Student[];
  isLoading: boolean;
  isError: boolean;
}

const StudentsContext = createContext<StudentsContextType>({
  students: mockStudents,
  isLoading: false,
  isError: false,
});

export function StudentsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    retry: 1,
    staleTime: 30_000,
  });

  return (
    <StudentsContext.Provider
      value={{
        students: data ?? mockStudents,
        isLoading,
        isError,
      }}
    >
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  return useContext(StudentsContext);
}

import React, { useState, useEffect, useCallback } from 'react';
import type { Course } from './types';
import { CourseTable } from './components/CourseTable';
import { CourseModal } from './components/CourseModal';
import { Toast, type ToastMessage } from './components/Toast';
import { PlusIcon } from './components/icons';
import { getCourses, addCourse, updateCourse, deleteCourse } from './services/sheetService';

const App: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao carregar cursos.';
      setError(errorMessage);
      setToast({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenModal = (course?: Course) => {
    setEditingCourse(course || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'userEmail' | 'createdAt'>) => {
    try {
      if (editingCourse) {
        const updatedCourse = await updateCourse(editingCourse.id, courseData);
        setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        setToast({ type: 'success', message: 'Curso atualizado com sucesso!' });
      } else {
        const newCourse = await addCourse(courseData);
        setCourses(prevCourses => [newCourse, ...prevCourses]);
        setToast({ type: 'success', message: 'Curso adicionado com sucesso!' });
      }
      handleCloseModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar curso.';
      setError(errorMessage);
      setToast({ type: 'error', message: errorMessage });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await deleteCourse(id);
        setCourses(courses.filter(c => c.id !== id));
        setToast({ type: 'success', message: 'Curso excluído com sucesso!' });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Falha ao excluir curso.';
        setError(errorMessage);
        setToast({ type: 'error', message: errorMessage });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-textPrimary font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-textPrimary">Gerenciador de Cursos</h1>
            <p className="text-textSecondary mt-2">Adicione, edite e remova cursos da sua planilha.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Curso
          </button>
        </header>

        {isLoading && (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-textSecondary">Carregando cursos...</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-lg relative text-center" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {!isLoading && !error && (
          <CourseTable 
            courses={courses} 
            onEdit={handleOpenModal} 
            onDelete={handleDeleteCourse} 
          />
        )}
      </main>
      
      {isModalOpen && (
        <CourseModal 
          course={editingCourse}
          onClose={handleCloseModal}
          onSave={handleSaveCourse}
        />
      )}
      
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
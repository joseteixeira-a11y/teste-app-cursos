import React, { useState, useEffect, useCallback } from 'react';
import type { Course } from './types';
import { CourseTable } from './components/CourseTable';
import { CourseModal } from './components/CourseModal';
import { EmailModal } from './components/EmailModal';
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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setUserEmail(savedEmail);
    } else {
      setIsEmailModalOpen(true);
      setIsLoading(false); // Stop loading as we need user input first
    }
  }, []);

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
    if (userEmail) {
      fetchCourses();
    }
  }, [userEmail, fetchCourses]);

  const handleOpenModal = (course?: Course) => {
    setEditingCourse(course || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  const handleSaveEmail = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('userEmail', email);
    setIsEmailModalOpen(false);
  };

  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'userEmail' | 'createdAt'>) => {
    if (!userEmail) {
      setToast({ type: 'error', message: 'E-mail do operador não encontrado. Por favor, identifique-se.' });
      setIsEmailModalOpen(true);
      return;
    }

    try {
      if (editingCourse) {
        const updatedCourse = await updateCourse(editingCourse.id, courseData);
        setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
        setToast({ type: 'success', message: 'Curso atualizado com sucesso!' });
      } else {
        const newCourse = await addCourse(courseData, userEmail);
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
          <div className="flex flex-col items-center sm:items-end gap-2">
            <button
              onClick={() => handleOpenModal()}
              disabled={!userEmail}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
              aria-disabled={!userEmail}
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar Curso
            </button>
            {userEmail ? (
              <div className="text-xs text-textSecondary text-center sm:text-right">
                <span>Operador: {userEmail}</span>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="ml-2 text-primary/80 hover:underline focus:outline-none"
                >
                  (Trocar)
                </button>
              </div>
            ) : (
               <div className="text-xs text-yellow-400">
                É necessário se identificar para adicionar.
              </div>
            )}
          </div>
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
        {!isLoading && !error && userEmail && (
          <CourseTable 
            courses={courses} 
            onEdit={handleOpenModal} 
            onDelete={handleDeleteCourse} 
          />
        )}
        {!userEmail && !isLoading && !error && (
           <div className="text-center py-16 px-6 bg-surface rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-textPrimary">Bem-vindo!</h2>
            <p className="text-textSecondary mt-2">Por favor, identifique-se para carregar e gerenciar os cursos.</p>
          </div>
        )}
      </main>

      {isEmailModalOpen && <EmailModal onSave={handleSaveEmail} />}
      
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
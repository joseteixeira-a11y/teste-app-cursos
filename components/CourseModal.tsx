
import React, { useState, useEffect, useRef } from 'react';
import type { Course } from '../types';

interface CourseModalProps {
  course: Course | null;
  onClose: () => void;
  onSave: (courseData: Omit<Course, 'id' | 'userEmail'| 'createdAt'>) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({ course, onClose, onSave }) => {
  const [description, setDescription] = useState('');
  const [isSecurity, setIsSecurity] = useState(false);
  const [isUdemy, setIsUdemy] = useState(false);
  const [error, setError] = useState('');

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (course) {
      setDescription(course.description);
      setIsSecurity(course.isSecurity);
      setIsUdemy(course.isUdemy);
    }
  }, [course]);
  
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.showModal();
    }

    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return;
    }
    setError('');
    onSave({ description, isSecurity, isUdemy });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
          onClose();
      }
  };

  return (
    <dialog ref={dialogRef} onClick={handleBackdropClick} onClose={onClose} className="bg-transparent p-0 backdrop:bg-black/50">
      <div className="w-full max-w-lg bg-surface rounded-lg shadow-xl p-6 m-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">{course ? 'Editar Curso' : 'Adicionar Novo Curso'}</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-textSecondary mb-2">
              Descrição do Curso
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-gray-600 rounded-md p-2 text-textPrimary focus:ring-2 focus:ring-primary focus:outline-none"
              rows={4}
              required
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isSecurity}
                onChange={(e) => setIsSecurity(e.target.checked)}
                className="h-5 w-5 rounded border-gray-600 bg-background text-primary focus:ring-primary"
              />
              <span className="ml-3 text-textPrimary">É da área de Segurança da Informação?</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isUdemy}
                onChange={(e) => setIsUdemy(e.target.checked)}
                className="h-5 w-5 rounded border-gray-600 bg-background text-primary focus:ring-primary"
              />
              <span className="ml-3 text-textPrimary">Está na plataforma Udemy?</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-secondary hover:bg-gray-600 text-textPrimary font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold transition-colors shadow"
            >
              {course ? 'Salvar Alterações' : 'Adicionar Curso'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

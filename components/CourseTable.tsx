
import React from 'react';
import type { Course } from '../types';
import { EditIcon, TrashIcon } from './icons';

interface CourseTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export const CourseTable: React.FC<CourseTableProps> = ({ courses, onEdit, onDelete }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-surface rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-textPrimary">Nenhum curso encontrado</h2>
        <p className="text-textSecondary mt-2">Clique em "Adicionar Curso" para começar a cadastrar.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-surface shadow-lg rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary">
            <tr>
              <th className="p-4 font-semibold">Descrição</th>
              <th className="p-4 font-semibold text-center">Segurança?</th>
              <th className="p-4 font-semibold text-center">Udemy?</th>
              <th className="p-4 font-semibold hidden md:table-cell">Operador</th>
              <th className="p-4 font-semibold hidden sm:table-cell">Criado em</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-background">
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-secondary transition-colors duration-200">
                <td className="p-4 max-w-xs xl:max-w-md break-words">{course.description}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${course.isSecurity ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>
                    {course.isSecurity ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${course.isUdemy ? 'bg-blue-800 text-blue-200' : 'bg-gray-700 text-gray-300'}`}>
                    {course.isUdemy ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="p-4 text-textSecondary hidden md:table-cell">{course.userEmail}</td>
                <td className="p-4 text-textSecondary hidden sm:table-cell">{formatDate(course.createdAt)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button onClick={() => onEdit(course)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors" aria-label="Editar">
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(course.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors" aria-label="Excluir">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

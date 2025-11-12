import React, { useState, useEffect, useRef } from 'react';

interface EmailModalProps {
  onSave: (email: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ onSave }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const validateEmail = (email: string) => {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('O e-mail é obrigatório.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    setError('');
    onSave(email);
  };

  return (
    <dialog ref={dialogRef} className="bg-transparent p-0 backdrop:bg-black/70">
      <div className="w-full max-w-md bg-surface rounded-lg shadow-xl p-6 m-4">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Identifique-se</h2>
        <p className="text-textSecondary mb-6">
          Por favor, insira seu e-mail. Ele será registrado na planilha sempre que você adicionar um novo curso.
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-2">
              Seu E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-gray-600 rounded-md p-2 text-textPrimary focus:ring-2 focus:ring-primary focus:outline-none"
              required
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-primary hover:bg-primary-hover text-white font-semibold transition-colors shadow"
            >
              Salvar e Continuar
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

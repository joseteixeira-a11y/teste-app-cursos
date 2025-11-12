import type { Course } from '../types';

// ====================================================================================
// AVISO: MOCK API
// Esta é uma implementação de API "mock" (falsa). Ela usa dados em memória para 
// simular a comunicação com um backend, permitindo que a interface do usuário 
// seja totalmente funcional para fins de demonstração.
//
// PARA PRODUÇÃO: Substitua as funções abaixo por chamadas de API reais para o seu
// backend, que neste caso seria um Google Apps Script implantado como Web App.
// O script `google-apps-script.js.txt` neste projeto contém o código necessário
// para o lado do Google Sheets.
//
// O fluxo seria:
// 1. Implantar o Google Apps Script.
// 2. Obter a URL do Web App.
// 3. Substituir o conteúdo de cada função aqui por uma chamada `fetch` para essa URL.
// ====================================================================================

// IMPORTANTE: Cole aqui a URL do seu Web App do Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzz-9kKYwAoi1r1rZi8hjMd-s9s_EqeJagPVHSIhzEsdsD5ReenetqD-bJObnnJkNz6mQ/exec'; 

// Função auxiliar para lidar com as respostas da API
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na API: ${response.statusText} - ${errorText}`);
  }
  const result = await response.json();
  if (result.status === 'error') {
    throw new Error(`Erro no script: ${result.message}`);
  }
  return result.data;
};

/**
 * Busca todos os cursos.
 */
export const getCourses = async (): Promise<Course[]> => {
  const response = await fetch(`${SCRIPT_URL}?action=read`);
  const data = await handleResponse(response);
  // Ordena os cursos por data de criação, do mais recente para o mais antigo
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Adiciona um novo curso.
 */
export const addCourse = async (
  courseData: Omit<Course, 'id' | 'userEmail' | 'createdAt'>
): Promise<Course> => {
  const payload = {
    action: 'create',
    data: courseData,
  };
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Apps Script web apps precisam disso para o corpo do POST
    },
  });
  return handleResponse(response);
};

/**
 * Atualiza um curso existente.
 */
export const updateCourse = async (id: string, courseData: Partial<Omit<Course, 'id' | 'userEmail' | 'createdAt'>>): Promise<Course> => {
  const payload = {
    action: 'update',
    id: id,
    data: courseData,
  };
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  });
  return handleResponse(response);
};

/**
 * Deleta um curso.
 */
export const deleteCourse = async (id: string): Promise<{ success: boolean }> => {
  const payload = {
    action: 'delete',
    id: id,
  };
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  });
  await handleResponse(response);
  return { success: true };
};
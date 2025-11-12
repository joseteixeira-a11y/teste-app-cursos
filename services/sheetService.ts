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
// **LEMBRE-SE:** Sempre que você alterar o código no `google-apps-script.js.txt`,
// você DEVE fazer uma NOVA IMPLANTAÇÃO para que as alterações entrem em vigor.
// (Vá em: Implantar > Gerenciar Implantações > Editar ✎ > Versão: Nova versão > Implantar)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSJNu_ubFLUMGXBW4k5FB1GbYYlXbVfuOHQ_UzrADtKx3xNWElzZOUY7ph1zdTqqqUoA/exec'; 

/**
 * Função auxiliar de fetch com tratamento de erro aprimorado para diagnosticar
 * problemas comuns de conexão com o Google Apps Script.
 */
const fetchWithEnhancedErrorHandling = async (url: string, options?: RequestInit): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Falha de Conexão (Failed to fetch): Não foi possível conectar-se à API do Google Sheets. ' +
        'Isso geralmente ocorre por um problema de CORS ou de configuração na implantação do Apps Script.\n\n' +
        'Verifique os seguintes pontos CRÍTICOS:\n' +
        '1. A URL do Script neste arquivo (`services/sheetService.ts`) está 100% correta?\n' +
        '2. Você criou uma "NOVA VERSÃO" na sua implantação do Apps Script após a última alteração de código?\n' +
        '3. A implantação está configurada para "Executar como: EU" e "Quem pode acessar: QUALQUER PESSOA"?\n' +
        '4. Abra o console do navegador (F12) e verifique a aba "Rede" (Network) para ver detalhes do erro.'
      );
    }
    // Re-lança outros tipos de erro
    throw error;
  }
};


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
  const response = await fetchWithEnhancedErrorHandling(`${SCRIPT_URL}?action=read`);
  const data = await handleResponse(response);
  // Ordena os cursos por data de criação, do mais recente para o mais antigo
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Adiciona um novo curso.
 * O e-mail do operador é capturado automaticamente pelo script no backend.
 * @param courseData - Os dados do curso a ser adicionado.
 */
export const addCourse = async (
  courseData: Omit<Course, 'id' | 'userEmail' | 'createdAt'>,
): Promise<Course> => {
  const payload = {
    action: 'create',
    data: courseData,
  };
  const response = await fetchWithEnhancedErrorHandling(SCRIPT_URL, {
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
  const response = await fetchWithEnhancedErrorHandling(SCRIPT_URL, {
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
  const response = await fetchWithEnhancedErrorHandling(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  });
  await handleResponse(response);
  return { success: true };
};
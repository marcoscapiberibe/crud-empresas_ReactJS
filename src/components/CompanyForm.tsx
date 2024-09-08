import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask';  // Importa a biblioteca para a máscara de entrada
import { useAuth } from '../hooks/useAuth';  // Hook para verificar e renovar tokens

interface CompanyFormProps {
  initialData?: {
    cnpj?: string;
    nome_razao?: string;
    nome_fantasia: string;
    cnae: string;
  };
  onSuccess: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onSuccess }) => {
  const { checkToken, isAuthenticated } = useAuth();  // Verifica se o token está válido
  const [cnpj, setCnpj] = useState(initialData?.cnpj || '');
  const [nomeRazao, setNomeRazao] = useState(initialData?.nome_razao || '');
  const [nomeFantasia, setNomeFantasia] = useState(initialData?.nome_fantasia || '');
  const [cnae, setCnae] = useState(initialData?.cnae || '');
  const [error, setError] = useState('');

  useEffect(() => {
    checkToken();  // Garante que o token seja válido antes de enviar qualquer requisição
  }, [checkToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      alert('Sua sessão expirou. Faça login novamente.');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const data = {
        nome_fantasia: nomeFantasia,
        cnae: cnae,
      };

      if (initialData?.cnpj) {
        // Atualiza a empresa
        await axios.put(`http://127.0.0.1:5000/empresa/${initialData.cnpj.replace(/[^\d]/g, '')}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        // Cria uma nova empresa
        await axios.post('http://127.0.0.1:5000/empresa', { ...data, cnpj: cnpj.replace(/[^\d]/g, ''), nome_razao: nomeRazao }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      onSuccess();
    } catch (error) {
      setError('Erro ao enviar os dados. Verifique os dados inseridos.');
      console.error('Erro ao enviar os dados', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {!initialData?.cnpj && (
        <>
          <div>
            <label>CNPJ:</label>
            <InputMask
              mask="99.999.999/9999-99"
              value={cnpj}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCnpj(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Razão Social:</label>
            <input
              type="text"
              value={nomeRazao}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeRazao(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <div>
        <label>Nome Fantasia:</label>
        <input
          type="text"
          value={nomeFantasia}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeFantasia(e.target.value)}
          required
        />
      </div>
      <div>
        <label>CNAE:</label>
        <InputMask
          mask="9999-9/99"
          value={cnae}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCnae(e.target.value)}
          required
        />
      </div>
      <button type="submit">{initialData?.cnpj ? 'Atualizar Empresa' : 'Criar Empresa'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default CompanyForm;

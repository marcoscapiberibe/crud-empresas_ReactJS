import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InputMask from 'react-input-mask';
import { useAuth } from '../hooks/useAuth';

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
  const inputRef = useRef(null);

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
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const data = {
        nome_fantasia: nomeFantasia,
        cnae: cnae,
      };

      console.log('Token JWT:', token);
      console.log('Dados enviados:', data);
      console.log('CNPJ formatado:', initialData?.cnpj?.replace(/[^\d]/g, ''));

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

  const formStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    width: '93%',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '10px',
    backgroundColor: '#2b2b2b',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px'
  };

  const buttonStyle = {
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    width: '100%',
  };

  const labelStyle = {
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const errorStyle = {
    color: 'red',
    marginTop: '10px',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {!initialData?.cnpj && (
        <>
          <div>
            <label style={labelStyle}>CNPJ:</label>
            <InputMask
              mask="99.999.999/9999-99"
              value={cnpj}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCnpj(e.target.value)}
              required
              inputRef={inputRef}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Razão Social:</label>
            <input
              type="text"
              value={nomeRazao}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeRazao(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
        </>
      )}

      <div>
        <label style={labelStyle}>Nome Fantasia:</label>
        <input
          type="text"
          value={nomeFantasia}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeFantasia(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>CNAE:</label>
        <InputMask
          mask="9999-9/99"
          value={cnae}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCnae(e.target.value)}
          required
          inputRef={inputRef}
          style={inputStyle}
        />
      </div>
      <button type="submit" style={buttonStyle}>{initialData?.cnpj ? 'Atualizar Empresa' : 'Criar Empresa'}</button>
      {error && <p style={errorStyle}>{error}</p>}
    </form>
  );
};

export default CompanyForm;

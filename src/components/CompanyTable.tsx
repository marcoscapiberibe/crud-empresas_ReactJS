import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import CompanyForm from './CompanyForm';

interface Company {
  cnpj: string;
  nome_razao: string;
  nome_fantasia: string;
  cnae: string;
}

interface CompanyTableProps {
  onLogout: () => void;  // Função para redirecionar para o login
}

const CompanyTable: React.FC<CompanyTableProps> = ({ onLogout }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null); // Corrigir o tipo

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage]);

  const fetchCompanies = async (page: number) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(`http://127.0.0.1:5000/empresas?start=${page * 25}&limit=25`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    const { empresas, total } = res.data;
    setCompanies(empresas);
    setPageCount(Math.ceil(total / 25));  // Usa o total para calcular o número de páginas
  };

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  const handleDelete = async (cnpj: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:5000/empresa/${cnpj}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchCompanies(currentPage); // Atualiza a lista após exclusão
    } catch (err) {
      console.error('Erro ao deletar empresa', err);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company); // Configura a empresa em edição
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove o token do localStorage
    onLogout(); // Redireciona para a tela de login
  };

  return (
    <div>
      <h2>Lista de Empresas</h2>

      {/* Botão de Sair */}
      <button onClick={handleLogout} style={{ float: 'right', marginBottom: '20px' }}>Sair</button>

      {/* Condição: Se não estiver editando, exibir o botão para criar nova empresa */}
      {!editingCompany && (
        <button onClick={() => setEditingCompany({ cnpj: '', nome_razao: '', nome_fantasia: '', cnae: '' })}>
          Criar Nova Empresa
        </button>
      )}

      {/* Exibir o formulário de edição ou criação */}
      {editingCompany && (
        <CompanyForm
          initialData={editingCompany.cnpj ? editingCompany : undefined}
          onSuccess={() => {
            setEditingCompany(null);
            fetchCompanies(currentPage);
          }}
        />
      )}

      {/* Exibir a tabela de empresas se não estiver criando ou editando */}
      {!editingCompany && (
        <table>
          <thead>
            <tr>
              <th>CNPJ</th>
              <th>Razão Social</th>
              <th>Nome Fantasia</th>
              <th>CNAE</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company: Company) => (
              <tr key={company.cnpj}>
                <td>{company.cnpj}</td>
                <td>{company.nome_razao}</td>
                <td>{company.nome_fantasia}</td>
                <td>{company.cnae}</td>
                <td>
                  <button onClick={() => handleEdit(company)}>Editar</button>
                  <button onClick={() => handleDelete(company.cnpj)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginação */}
      <ReactPaginate
        previousLabel={'Anterior'}
        nextLabel={'Próximo'}
        breakLabel={'...'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        activeClassName={'active'}
      />
    </div>
  );
};

export default CompanyTable;

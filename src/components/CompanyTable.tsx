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
  onLogout: () => void;
}

const CompanyTable: React.FC<CompanyTableProps> = ({ onLogout }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa
  const [sortColumn, setSortColumn] = useState('cnpj'); // Coluna padrão de ordenação
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Direção padrão

  useEffect(() => {
    fetchCompanies(currentPage, searchTerm, sortColumn, sortDirection);
  }, [currentPage, searchTerm, sortColumn, sortDirection]);

  const fetchCompanies = async (page: number, search: string, sort: string, dir: string) => {
    const token = localStorage.getItem('token');
    const res = await axios.get(
      `http://127.0.0.1:5000/empresas?start=${page * 25}&limit=25&search=${search}&sort=${sort}&dir=${dir}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { empresas, total } = res.data;
    setCompanies(empresas);
    setPageCount(Math.ceil(total / 25));
  };

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  const handleDelete = async (cnpj: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:5000/empresa/${cnpj}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCompanies(currentPage, searchTerm, sortColumn, sortDirection); // Atualiza a lista após exclusão
    } catch (err) {
      console.error('Erro ao deletar empresa', err);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reinicia para a primeira página quando a pesquisa for alterada
  };

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  return (
    <div>
      <h2>Lista de Empresas</h2>

      <button onClick={handleLogout} style={{ float: 'right', marginBottom: '20px' }}>Sair</button>

      {/* Campo de pesquisa */}
      <input
        type="text"
        placeholder="Pesquisar empresas..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginBottom: '20px', display: 'block' }}
      />

      {!editingCompany && (
        <button onClick={() => setEditingCompany({ cnpj: '', nome_razao: '', nome_fantasia: '', cnae: '' })}>
          Criar Nova Empresa
        </button>
      )}

      {editingCompany && (
        <CompanyForm
          initialData={editingCompany.cnpj ? editingCompany : undefined}
          onSuccess={() => {
            setEditingCompany(null);
            fetchCompanies(currentPage, searchTerm, sortColumn, sortDirection);
          }}
        />
      )}

      {!editingCompany && (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('cnpj')}>CNPJ</th>
              <th onClick={() => handleSort('nome_razao')}>Razão Social</th>
              <th onClick={() => handleSort('nome_fantasia')}>Nome Fantasia</th>
              <th onClick={() => handleSort('cnae')}>CNAE</th>
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

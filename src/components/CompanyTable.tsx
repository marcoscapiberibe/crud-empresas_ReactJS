import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';

interface Company {
  cnpj: string;
  nome_razao: string;
  nome_fantasia: string;
  cnae: string;
}

const CompanyTable: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchCompanies(currentPage);
  }, [currentPage]);

  const fetchCompanies = async (page: number) => {
    const res = await axios.get(`http://127.0.0.1:5000/empresas?start=${page * 25}&limit=25`);
    setCompanies(res.data);
    setPageCount(Math.ceil(100 / 25));
  };

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  return (
    <div>
      <h2>Lista de Empresas</h2>
      <table>
        <thead>
          <tr>
            <th>CNPJ</th>
            <th>Razão Social</th>
            <th>Nome Fantasia</th>
            <th>CNAE</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.cnpj}>
              <td>{company.cnpj}</td>
              <td>{company.nome_razao}</td>
              <td>{company.nome_fantasia}</td>
              <td>{company.cnae}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
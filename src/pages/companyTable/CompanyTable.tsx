import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import CompanyForm from '../../components/CompanyForm';
import {
    Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, IconButton, Box, InputAdornment,
    Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { Logout, Edit, Delete, Clear, ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import './CompanyTable.css';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('cnpj');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [open, setOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

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

    const handleDelete = async () => {
        let token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (!token || !companyToDelete) {
            console.error('Nenhum token disponível ou empresa para deletar.');
            return;
        }

        try {
            await axios.delete(`http://127.0.0.1:5000/empresa/${companyToDelete.cnpj}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchCompanies(currentPage, searchTerm, sortColumn, sortDirection); // Atualiza a lista após exclusão
            setConfirmDeleteOpen(false); // Fecha o modal de confirmação após excluir
        } catch (err) {
            console.error('Erro ao deletar empresa', err);
        }
    };

    const handleConfirmDelete = (company: Company) => {
        setCompanyToDelete(company);
        setConfirmDeleteOpen(true); // Abre o modal de confirmação
    };

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        setOpen(true);  // Abrir o modal
    };

    const handleCreate = () => {
        setEditingCompany({ cnpj: '', nome_razao: '', nome_fantasia: '', cnae: '' });
        setOpen(true);  // Abrir o modal
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        onLogout();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(0); // Reinicia a página ao limpar a busca
    };

    const handleSort = (column: string) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);
    };

    const formatCNPJ = (cnpj: string) => {
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    };

    const handleClose = () => {
        setOpen(false);  // Fechar o modal
    };

    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);  // Fechar o modal de confirmação
    };

    return (
        <div style={{ marginTop: '10px' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <h2 style={{ marginLeft: '10px' }}>Lista de Empresas</h2>
                <Button
                    onClick={handleLogout}
                    variant="contained"
                    color="secondary"
                    startIcon={<Logout />}
                    style={{ marginRight: '10px' }}
                >
                    Sair
                </Button>
            </Box>

            <Box display="flex" justifyContent="space-between" mb={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreate}
                    fullWidth
                    style={{ marginRight: '20px', marginLeft: '10px' }}
                >
                    Criar Nova Empresa
                </Button>
                <TextField
                    label="Pesquisar empresas"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        endAdornment: searchTerm && (
                            <InputAdornment position="end">
                                <IconButton onClick={handleClearSearch}>
                                    <Clear />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    style={{ marginRight: '10px' }}
                />
            </Box>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>{editingCompany?.cnpj ? 'Editar Empresa' : 'Criar Nova Empresa'}</DialogTitle>
                <DialogContent>
                    <CompanyForm
                        initialData={editingCompany || undefined}
                        onSuccess={() => {
                            setOpen(false);  // Fechar o modal após sucesso
                            fetchCompanies(currentPage, searchTerm, sortColumn, sortDirection);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained" color="secondary" style={{ marginRight: '30px', marginBottom: '20px' }}>Cancelar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDelete}>
                <DialogTitle>Apagar</DialogTitle>
                <DialogContent>Tem certeza que deseja excluir a empresa?</DialogContent>
                <DialogActions style={{ marginRight: '15px', marginBottom: '20px' }}>
                    <Button onClick={handleCloseConfirmDelete}  variant="contained" color="secondary">Cancelar</Button>
                    <Button onClick={handleDelete}  variant="contained" color="primary">Confirmar</Button>
                </DialogActions>
            </Dialog>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            onClick={() => handleSort('cnpj')}
                            sx={{ fontWeight: 'bold', fontSize: 18, cursor: 'pointer', '&:hover': { color: 'GrayText' } }}
                        >
                            CNPJ {sortColumn === 'cnpj' && (sortDirection === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />)}
                        </TableCell>
                        <TableCell
                            onClick={() => handleSort('nome_razao')}
                            sx={{ fontWeight: 'bold', fontSize: 18, cursor: 'pointer', '&:hover': { color: 'GrayText' } }}
                        >
                            Razão Social {sortColumn === 'nome_razao' && (sortDirection === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />)}
                        </TableCell>
                        <TableCell
                            onClick={() => handleSort('nome_fantasia')}
                            sx={{ fontWeight: 'bold', fontSize: 18, cursor: 'pointer', '&:hover': { color: 'GrayText' } }}
                        >
                            Nome Fantasia {sortColumn === 'nome_fantasia' && (sortDirection === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />)}
                        </TableCell>
                        <TableCell
                            onClick={() => handleSort('cnae')}
                            sx={{ fontWeight: 'bold', fontSize: 18, cursor: 'pointer', '&:hover': { color: 'GrayText' } }}
                        >
                            CNAE {sortColumn === 'cnae' && (sortDirection === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />)}
                        </TableCell>
                        <TableCell style={{ fontWeight: 'bold', fontSize: 18 }}>Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {companies.map((company: Company) => (
                        <TableRow key={company.cnpj}>
                            <TableCell>{formatCNPJ(company.cnpj)}</TableCell>
                            <TableCell>{company.nome_razao}</TableCell>
                            <TableCell>{company.nome_fantasia}</TableCell>
                            <TableCell>{company.cnae}</TableCell>
                            <TableCell>
                                <IconButton onClick={() => handleEdit(company)} color="primary">
                                    <Edit />
                                </IconButton>
                                <IconButton onClick={() => handleConfirmDelete(company)} color="secondary">
                                    <Delete />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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

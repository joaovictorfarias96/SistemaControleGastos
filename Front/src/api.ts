import axios from 'axios';
import { Pessoa, Categoria, Transacao } from './types';

export const api = axios.create({
    baseURL: 'http://localhost:5272/api', // Verifique a porta do seu Back-end
});

export const PessoaService = {
    listar: () => api.get<Pessoa[]>('/Pessoa'),
    salvar: (pessoa: Pessoa) => api.post('/Pessoa', pessoa),
    excluir: (id: string) => api.delete(`/Pessoa/${id}`),
};

export const CategoriaService = {
    listar: () => api.get<Categoria[]>('/Categoria'),
    salvar: (cat: Categoria) => api.post('/Categoria', cat),
};

export const TransacaoService = {
    listar: () => api.get<any[]>('/Transacao'),
    salvar: (trans: Transacao) => api.post('/Transacao', trans),
};

export const RelatorioService = {
    totaisPorPessoa: () => api.get('/Relatorio/totais-por-pessoa'),
};
export type Finalidade = 'Despesa' | 'Receita' | 'Ambas';
export type TipoTransacao = 'Despesa' | 'Receita';

export interface Pessoa {
    id?: string;
    nome: string;
    idade: number;
}

export interface Categoria {
    id?: string;
    descricao: string;
    finalidade: Finalidade;
}

export interface Transacao {
    id?: string;
    descricao: string;
    valor: number;
    tipo: TipoTransacao;
    pessoaId: string;
    categoriaId: string;
}

export interface RelatorioPessoa {
    nome: string;
    receitas: number;
    despesas: number;
    saldo: number;
}
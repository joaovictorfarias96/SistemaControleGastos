import { useState, useEffect, useCallback } from 'react';
import { Pessoa, Categoria, Transacao } from '../types';
import { PessoaService, CategoriaService, TransacaoService } from '../api';

export const useTransacoes = () => {
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(false);

    // Memoizamos a função para poder usá-la no useEffect e expô-la no return
    const carregarDados = useCallback(async () => {
        try {
            const [resPessoas, resCategorias] = await Promise.all([
                PessoaService.listar(),
                CategoriaService.listar()
            ]);
            setPessoas(resPessoas.data);
            setCategorias(resCategorias.data);
        } catch (error) {
            console.error("Erro ao buscar dados do back-end", error);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const salvarTransacao = async (transacao: Transacao) => {
        // Encontra os objetos para validar as regras de negócio
        const pessoa = pessoas.find(p => p.id === transacao.pessoaId);
        const categoria = categorias.find(c => c.id === transacao.categoriaId);

        if (!pessoa || !categoria) {
            alert("Selecione os dados corretamente.");
            return false;
        }

        // Regra: Menores de 18
        if (pessoa.idade < 18 && transacao.tipo === 'Receita') {
            alert("Menores de 18 anos só registram despesas.");
            return false;
        }

        // Normalização para comparação (evita erro de Receita vs receita)
        const finalidadeCat = categoria.finalidade.toString().toLowerCase();
        const tipoTransacao = transacao.tipo.toString().toLowerCase();

        if (tipoTransacao === 'despesa' && finalidadeCat === 'receita') {
            alert("Esta categoria é exclusiva para Receitas.");
            return false;
        }
        if (tipoTransacao === 'receita' && finalidadeCat === 'despesa') {
            alert("Esta categoria é exclusiva para Despesas.");
            return false;
        }

        try {
            setLoading(true);
            await TransacaoService.salvar(transacao);
            alert("Transação salva com sucesso!");
            await carregarDados(); // Recarrega para atualizar saldos se necessário
            return true;
        } catch (err) {
            alert("Erro ao salvar no servidor.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { pessoas, categorias, salvarTransacao, loading, carregarDados };
};
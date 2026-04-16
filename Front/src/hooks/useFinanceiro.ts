import { useState } from 'react';
import { TransacaoService } from '../api';
import { Transacao } from '../types';

export const useFinanceiro = () => {
    const [loading, setLoading] = useState(false);

    const cadastrarTransacao = async (data: Transacao, idadePessoa: number) => {
        // Validação no Front-end (Boa prática de UX)
        if (idadePessoa < 18 && data.tipo === 'Receita') {
            alert("Erro: Menores de 18 anos só podem registrar despesas.");
            return false;
        }

        try {
            setLoading(true);
            await TransacaoService.salvar(data);
            return true;
        } catch (error: any) {
            alert(error.response?.data || "Erro ao salvar transação");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { cadastrarTransacao, loading };
};
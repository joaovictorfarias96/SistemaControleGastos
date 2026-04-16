import { useState, useEffect, useCallback } from 'react';
import { RelatorioService } from '../api';

interface RelatorioData {
    detalhamentoPorPessoa: Array<{
        nome: string;
        receitas: number;
        despesas: number;
        saldo: number;
    }>;
    resumoGeral: {
        totalGeralReceitas: number;
        totalGeralDespesas: number;
        saldoLiquidoGeral: number;
    };
}

export const useRelatorios = () => {
    const [dados, setDados] = useState<RelatorioData | null>(null);
    const [loading, setLoading] = useState(true);

    const carregarRelatorio = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await RelatorioService.totaisPorPessoa();
            setDados(data);
        } catch (error) {
            console.error("Erro ao carregar relatório:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarRelatorio();
    }, [carregarRelatorio]);

    return { dados, loading, refresh: carregarRelatorio };
};
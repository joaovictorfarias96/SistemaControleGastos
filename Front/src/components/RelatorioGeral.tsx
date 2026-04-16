import React from 'react';
import { useRelatorios } from '../hooks/useRelatorios';

const RelatorioGeral: React.FC = () => {
    const { dados, loading, refresh } = useRelatorios();

    if (loading) return <div className="p-4 text-center">Processando totais...</div>;
    if (!dados) return <div className="p-4 text-red-500">Erro ao carregar dados do relatório.</div>;

    const formatarMoeda = (valor: number) => 
        valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="bg-white p-6 shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Totais por Pessoa</h2>
                <button 
                    onClick={refresh}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm transition"
                >
                    Atualizar Dados
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-3 font-semibold text-gray-600">Pessoa</th>
                            <th className="p-3 font-semibold text-gray-600">Receitas</th>
                            <th className="p-3 font-semibold text-gray-600">Despesas</th>
                            <th className="p-3 font-semibold text-gray-600">Saldo Individual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.detalhamentoPorPessoa.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 transition">
                                <td className="p-3">{item.nome}</td>
                                <td className="p-3 text-green-600">{formatarMoeda(item.receitas)}</td>
                                <td className="p-3 text-red-600">{formatarMoeda(item.despesas)}</td>
                                <td className={`p-3 font-bold ${item.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {formatarMoeda(item.saldo)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Rodapé com Total Geral - Atendendo o Requisito Final */}
            <div className="mt-8 p-4 bg-gray-800 rounded-lg text-white grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-gray-400 text-sm uppercase">Total Receitas</p>
                    <p className="text-xl font-bold text-green-400">{formatarMoeda(dados.resumoGeral.totalGeralReceitas)}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-sm uppercase">Total Despesas</p>
                    <p className="text-xl font-bold text-red-400">{formatarMoeda(dados.resumoGeral.totalGeralDespesas)}</p>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-gray-600">
                    <p className="text-gray-400 text-sm uppercase">Saldo Líquido Geral</p>
                    <p className={`text-2xl font-black ${dados.resumoGeral.saldoLiquidoGeral >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                        {formatarMoeda(dados.resumoGeral.saldoLiquidoGeral)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RelatorioGeral;
import React, { useState } from 'react';
import { useTransacoes } from '../hooks/useTransacoes';
import { Transacao, TipoTransacao } from '../types';

const TransacaoForm: React.FC = () => {
    const { pessoas, categorias, salvarTransacao, loading } = useTransacoes();
    const [form, setForm] = useState<Transacao>({
        descricao: '',
        valor: 0,
        tipo: 'Despesa',
        pessoaId: '',
        categoriaId: ''
    });

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        const sucesso = await salvarTransacao(form);
        if (sucesso) setForm({ ...form, descricao: '', valor: 0 });
    };

    // Filtra categorias dinamicamente no Select para evitar erros do usuário
    const categoriasExibiveis = categorias.filter(c => {
        // 1. Captura a finalidade independente de vir como 'finalidade' ou 'Finalidade'
        // O C# envia Enums como números por padrão: 0 = Despesa, 1 = Receita, 2 = Ambas
        const fRaw = (c as any).finalidade !== undefined ? (c as any).finalidade : (c as any).Finalidade;

        // 2. Converte o valor para string para facilitar a comparação
        const finalidade = String(fRaw);
        const tipoSelecionado = form.tipo.toLowerCase(); // 'despesa' ou 'receita'

        // 3. Lógica de comparação híbrida (Texto ou Número do Enum)
        const isAmbas = finalidade === '2' || finalidade.toLowerCase() === 'ambas';
        const isDespesa = (finalidade === '0' || finalidade.toLowerCase() === 'despesa') && tipoSelecionado === 'despesa';
        const isReceita = (finalidade === '1' || finalidade.toLowerCase() === 'receita') && tipoSelecionado === 'receita';

        return isAmbas || isDespesa || isReceita;
    });
    return (
        <form onSubmit={handleSalvar} className="bg-white p-6 shadow rounded-lg grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">Descrição (Máx 400)</label>
                <input
                    className="w-full border p-2 rounded"
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                    maxLength={400}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Tipo</label>
                <select
                    className="w-full border p-2 rounded"
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value as TipoTransacao, categoriaId: '' })}
                >
                    <option value="Despesa">Despesa</option>
                    <option value="Receita">Receita</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Valor</label>
                <input
                    type="number" step="0.01" className="w-full border p-2 rounded"
                    value={form.valor}
                    onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Pessoa</label>
                <select
                    className="w-full border p-2 rounded"
                    value={form.pessoaId}
                    onChange={e => setForm({ ...form, pessoaId: e.target.value })}
                    required
                >
                    <option value="">Selecione...</option>
                    {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.idade} anos)</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Categoria</label>
                <select
                    className="w-full border p-2 rounded"
                    value={form.categoriaId}
                    onChange={e => setForm({ ...form, categoriaId: e.target.value })}
                    required
                >
                    <option value="">
                        {categorias.length === 0 ? 'Nenhuma categoria cadastrada' : 'Selecione a categoria...'}
                    </option>
                    {categoriasExibiveis.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.descricao}
                        </option>
                    ))}
                </select>

                {/* Aviso caso o filtro tenha escondido tudo */}
                {categorias.length > 0 && categoriasExibiveis.length === 0 && (
                    <p className="text-xs text-orange-500 mt-1">
                        Nenhuma categoria disponível para o tipo: <strong>{form.tipo}</strong>
                    </p>
                )}
            </div>

            <button
                disabled={loading}
                className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
                {loading ? 'Salvando...' : 'Registrar Transação'}
            </button>
        </form>
    );
};
export default TransacaoForm;
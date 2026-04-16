import React, { useState } from 'react';
import { useCategorias } from '../hooks/useCategoria';
import { Finalidade } from '../types';

const CategoriaForm: React.FC = () => {
    const { adicionarCategoria, loading } = useCategorias();
    const [descricao, setDescricao] = useState('');
    const [finalidade, setFinalidade] = useState<Finalidade>('Ambas');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (descricao.length > 400) return alert("Descrição muito longa!");

        const sucesso = await adicionarCategoria({ descricao, finalidade });
        if (sucesso) {
            setDescricao('');
            alert("Categoria adicionada! Agora ela aparecerá no formulário de transações.");
        }
    };

    return (
        <div className="bg-white p-6 shadow rounded-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Novo Cadastro de Categoria</h2>
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Descrição (Máx 400)</label>
                    <input 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={descricao}
                        onChange={e => setDescricao(e.target.value)}
                        placeholder="Ex: Alimentação, Salário, Lazer..."
                        required
                    />
                </div>
                <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700">Finalidade</label>
                    <select 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={finalidade}
                        onChange={e => setFinalidade(e.target.value as Finalidade)}
                    >
                        <option value="Despesa">Despesa</option>
                        <option value="Receita">Receita</option>
                        <option value="Ambas">Ambas</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="self-end bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-colors font-bold"
                >
                    {loading ? 'Salvando...' : 'Adicionar'}
                </button>
            </form>
        </div>
    );
};

export default CategoriaForm;
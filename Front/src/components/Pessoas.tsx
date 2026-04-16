import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Pessoa } from '../types';

const Pessoas: React.FC = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState<number>(0);

  const carregarPessoas = async () => {
    const response = await api.get('/Pessoa');
    setPessoas(response.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/Pessoa', { nome, idade });
    setNome('');
    setIdade(0);
    carregarPessoas();
  };

  const excluirPessoa = async (id: string) => {
    if (window.confirm("Ao excluir, todas as transações desta pessoa serão apagadas. Confirmar?")) {
      await api.delete(`/Pessoa/${id}`);
      carregarPessoas();
    }
  };

  useEffect(() => { carregarPessoas(); }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Cadastro de Pessoas</h2>
      
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input 
          placeholder="Nome" 
          value={nome} 
          onChange={e => setNome(e.target.value)}
          className="border p-2 rounded"
          maxLength={200}
          required
        />
        <input 
          type="number" 
          placeholder="Idade" 
          value={idade} 
          onChange={e => setIdade(Number(e.target.value))}
          className="border p-2 rounded w-20"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Cadastrar</button>
      </form>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nome</th>
            <th className="border p-2 text-left">Idade</th>
            <th className="border p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pessoas.map(p => (
            <tr key={p.id}>
              <td className="border p-2">{p.nome}</td>
              <td className="border p-2">{p.idade}</td>
              <td className="border p-2 text-center">
                <button onClick={() => excluirPessoa(p.id!)} className="text-red-500">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pessoas;
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  // Estados para dados da API
  const [transacoes, setTransacoes] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o formulário de cadastro
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [pessoaId, setPessoaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  const API_BASE = "http://localhost:5272/api";

  const carregarTudo = async () => {
    setLoading(true);
    try {
      const [resT, resP, resC] = await Promise.all([
        fetch(`${API_BASE}/Transacao`),
        fetch(`${API_BASE}/Pessoa`),
        fetch(`${API_BASE}/Categoria`)
      ]);
      
      setTransacoes(await resT.json());
      setPessoas(await resP.json());
      setCategorias(await resC.json());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarTudo(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const novaTransacao = { 
      descricao, 
      valor: parseFloat(valor), 
      tipo, 
      pessoaId, 
      categoriaId 
    };

    const response = await fetch(`${API_BASE}/Transacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaTransacao)
    });

    if (response.ok) {
      alert("Lançamento realizado!");
      setDescricao('');
      setValor('');
      carregarTudo();
    } else {
      const msg = await response.text();
      alert("Erro na Regra de Negócio: " + msg);
    }
  };

  const deletar = async (id) => {
    if (confirm("Excluir transação?")) {
      await fetch(`${API_BASE}/Transacao/${id}`, { method: 'DELETE' });
      carregarTudo();
    }
  };

  const saldoTotal = transacoes.reduce((acc, t) => 
    t.tipo.toLowerCase() === 'receita' ? acc + t.valor : acc - t.valor, 0);

  if (loading) return <div className="loader">Sincronizando com a API...</div>;

  return (
    <div className="container">
      <header className="main-header">
        <h1>Serviço de Fluxo Financeiro - SFF 💰</h1>
      </header>

      {/* SEÇÃO DE CADASTRO */}
      <section className="form-card">
        <h3>➕ Novo Lançamento</h3>
        <form onSubmit={handleSubmit} className="grid-form">
          <input type="text" placeholder="Descrição (ex: Aluguel)" value={descricao} 
            onChange={e => setDescricao(e.target.value)} required />
          
          <input type="number" placeholder="Valor (R$)" value={valor} 
            onChange={e => setValor(e.target.value)} required />

          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="despesa">🔴 Despesa</option>
            <option value="receita">🟢 Receita</option>
          </select>

          <select value={pessoaId} onChange={e => setPessoaId(e.target.value)} required>
            <option value="">Selecione a Pessoa</option>
            {pessoas.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.idade} anos)</option>)}
          </select>

          <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
            <option value="">Selecione a Categoria</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
          </select>

          <button type="submit" className="btn-cadastrar">Cadastrar Lançamento</button>
        </form>
      </section>

      {/* DASHBOARD */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <h4>Saldo Atual</h4>
          <p className={saldoTotal >= 0 ? 'pos' : 'neg'}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoTotal)}
          </p>
        </div>
      </div>

      <section className="table-section">
        <h3>Visualização das Transações</h3>
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Pessoa</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transacoes.map(t => (
              <tr key={t.id}>
                <td>{t.descricao}</td>
                <td>{t.pessoaNome}</td>
                <td>{t.categoriaDesc}</td>
                <td className={t.tipo === 'receita' ? 't-pos' : 't-neg'}>
                  {t.tipo === 'receita' ? '+ ' : '- '}
                  {t.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                </td>
                <td>
                  <button onClick={() => deletar(t.id)} className="btn-icon">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
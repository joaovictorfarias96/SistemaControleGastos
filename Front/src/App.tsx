import { useEffect, useState, useCallback, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Pessoa { id: string; nome: string; idade: number; }
interface Categoria { id: string; descricao: string; finalidade: 'despesa' | 'receita' | 'ambas'; }
interface Transacao { 
    id: string; descricao: string; valor: number; tipo: 'despesa' | 'receita'; 
    pessoaId: string; categoriaId: string; pessoaNome?: string; categoriaDesc?: string;
}

const API_BASE = "http://localhost:5272/api"; 

const App: React.FC = () => {
  const [data, setData] = useState<{ transacoes: Transacao[], pessoas: Pessoa[], categorias: Categoria[] }>({
    transacoes: [], pessoas: [], categorias: []
  });
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'painel' | 'totais'>('painel');
  const [usuarioComGrafico, setUsuarioComGrafico] = useState<string | null>(null);
  const [buscaUsuario, setBuscaUsuario] = useState('');

  // Estados de Formulário
  const [editandoPessoa, setEditandoPessoa] = useState<Pessoa | null>(null);
  const [formP, setFormP] = useState({ nome: '', idade: '' });
  const [formT, setFormT] = useState({ desc: '', valor: '', tipo: 'despesa', pId: '', cId: '' });

  const fetchData = useCallback(async () => {
    try {
      const [resT, resP, resC] = await Promise.all([
        fetch(`${API_BASE}/Transacao`), fetch(`${API_BASE}/Pessoa`), fetch(`${API_BASE}/Categoria`)
      ]);
      setData({ transacoes: await resT.json(), pessoas: await resP.json(), categorias: await resC.json() });
    } catch (err) { console.error("Erro ao buscar dados:", err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- SALVAR USUÁRIO (COM ALERTA E LIMPEZA) ---
  const handleSalvarPessoa = async () => {
    const nome = editandoPessoa ? editandoPessoa.nome : formP.nome;
    const idade = editandoPessoa ? editandoPessoa.idade : Number(formP.idade);

    if (!nome || !idade) return alert("Preencha Nome e Idade!");

    const isEdicao = !!editandoPessoa;
    const url = isEdicao ? `${API_BASE}/Pessoa/${editandoPessoa.id}` : `${API_BASE}/Pessoa`;
    
    try {
      const res = await fetch(url, {
        method: isEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdicao ? { id: editandoPessoa.id, nome, idade } : { nome, idade })
      });

      if (res.ok) {
        alert(isEdicao ? "✅ Usuário atualizado com sucesso!" : "✅ Usuário cadastrado com sucesso!");
        setEditandoPessoa(null);
        setFormP({ nome: '', idade: '' });
        await fetchData();
      } else {
        alert("Erro ao salvar usuário no banco.");
      }
    } catch (err) { alert("Erro de conexão com o servidor."); }
  };

  // --- REGISTRAR GASTO/RECEITA (CORRIGIDO COM ALERTA E LIMPEZA) ---
  const handleRegistrarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação antes de enviar
    if (!formT.pId || !formT.cId || !formT.valor) {
        alert("Por favor, selecione o usuário, a categoria e o valor.");
        return;
    }

    const payload = {
        descricao: formT.desc,
        valor: parseFloat(formT.valor),
        tipo: formT.tipo,
        pessoaId: formT.pId,
        categoriaId: formT.cId
    };

    try {
      const res = await fetch(`${API_BASE}/Transacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`✅ ${formT.tipo === 'receita' ? 'Receita' : 'Despesa'} registrada com sucesso!`);
        // LIMPA O FORMULÁRIO DE GASTOS
        setFormT({ desc: '', valor: '', tipo: 'despesa', pId: '', cId: '' });
        await fetchData();
      } else {
        const txt = await res.text();
        alert("Erro ao registrar: " + txt);
      }
    } catch (err) {
      alert("Erro de conexão ao registrar gasto.");
    }
  };

  const getChartData = (pId: string) => {
    const tPessoa = data.transacoes.filter(t => t.pessoaId === pId);
    const map: { [key: string]: number } = {};
    tPessoa.forEach(t => { map[t.categoriaDesc || 'Outros'] = (map[t.categoriaDesc || 'Outros'] || 0) + t.valor; });
    return {
      labels: Object.keys(map),
      datasets: [{ data: Object.values(map), backgroundColor: ['#a855f7', '#00d2ff', '#ff4747', '#ffce56', '#4BC0C0'], borderWidth: 0 }]
    };
  };

  const pessoasFiltradas = useMemo(() => {
    return data.pessoas.filter(p => p.nome.toLowerCase().includes(buscaUsuario.toLowerCase()));
  }, [data.pessoas, buscaUsuario]);

  if (loading) return <div className="loading-screen">FinanceSystem...</div>;

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Finance<span>System</span></h1>
        <nav className="nav-tabs">
          <button className={abaAtiva === 'painel' ? 'active' : ''} onClick={() => setAbaAtiva('painel')}>Lançamentos</button>
          <button className={abaAtiva === 'totais' ? 'active' : ''} onClick={() => setAbaAtiva('totais')}>Gestão e Usuários</button>
        </nav>
      </header>

      {abaAtiva === 'painel' ? (
        <main className="dashboard fade-in">
          <div className="main-layout">
            <aside className="sidebar">
              {/* FORMULÁRIO DE GASTOS COMPLETO */}
              <div className="glass-card">
                <h3>Novo Lançamento</h3>
                <form className="form-ui" onSubmit={handleRegistrarGasto}>
                  <input placeholder="Descrição" value={formT.desc} onChange={e => setFormT({...formT, desc: e.target.value})} required />
                  <div className="form-row">
                    <input type="number" placeholder="Valor" step="0.01" value={formT.valor} onChange={e => setFormT({...formT, valor: e.target.value})} required />
                    <select value={formT.tipo} onChange={e => setFormT({...formT, tipo: e.target.value as any})}>
                      <option value="despesa">Despesa</option>
                      <option value="receita">Receita</option>
                    </select>
                  </div>
                  <select value={formT.pId} onChange={e => setFormT({...formT, pId: e.target.value})} required>
                    <option value="">Para quem?</option>
                    {data.pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                  <select value={formT.cId} onChange={e => setFormT({...formT, cId: e.target.value})} required>
                    <option value="">Qual categoria?</option>
                    {data.categorias
                      .filter(c => c.finalidade === 'ambas' || c.finalidade === formT.tipo)
                      .map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
                  </select>
                  <button type="submit" className="btn-primary">Registrar Lançamento</button>
                </form>
              </div>

              {/* FORMULÁRIO DE PESSOA */}
              <div className="glass-card mt-2">
                <h3>{editandoPessoa ? '✏️ Alterar Usuário' : '👤 Novo Usuário'}</h3>
                <div className="form-ui">
                  <input placeholder="Nome" value={editandoPessoa ? editandoPessoa.nome : formP.nome} onChange={e => editandoPessoa ? setEditandoPessoa({...editandoPessoa, nome: e.target.value}) : setFormP({...formP, nome: e.target.value})} />
                  <input type="number" placeholder="Idade" value={editandoPessoa ? editandoPessoa.idade : formP.idade} onChange={e => editandoPessoa ? setEditandoPessoa({...editandoPessoa, idade: Number(e.target.value)}) : setFormP({...formP, idade: e.target.value})} />
                  <button className="btn-primary" onClick={handleSalvarPessoa}>
                    {editandoPessoa ? 'Salvar Alterações' : 'Cadastrar Pessoa'}
                  </button>
                  {editandoPessoa && <button className="btn-link" onClick={() => {setEditandoPessoa(null); setFormP({nome:'', idade:''})}}>Cancelar</button>}
                </div>
              </div>
            </aside>

            <section className="glass-card content-area">
                <h3>Histórico Recente</h3>
                <div className="table-scroll">
                    <table>
                        <thead><tr><th>Item</th><th>Pessoa</th><th>Valor</th></tr></thead>
                        <tbody>
                            {data.transacoes.map(t => (
                                <tr key={t.id}>
                                    <td>{t.descricao}</td>
                                    <td><small>{t.pessoaNome}</small></td>
                                    <td className={t.tipo === 'receita' ? 't-pos' : 't-neg'}>R$ {t.valor.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
          </div>
        </main>
      ) : (
        <div className="history-container fade-in">
          <div className="report-header glass-card">
              <label className="label-roxo">BUSCAR USUÁRIO</label>
              <input className="styled-input" placeholder="🔍 Digite o nome..." value={buscaUsuario} onChange={e => setBuscaUsuario(e.target.value)} />
          </div>
          <div className="history-grid">
            {pessoasFiltradas.map(p => {
                const isExp = usuarioComGrafico === p.id;
                return (
                    <div key={p.id} className={`person-card glass-card ${isExp ? 'expanded' : ''}`}>
                        <div className="p-header">
                            <h4>{p.nome}</h4>
                            <div className="p-actions">
                                <button onClick={() => setUsuarioComGrafico(isExp ? null : p.id)} className="btn-mini">{isExp ? '📋' : '📊'}</button>
                                <button onClick={() => {setEditandoPessoa(p); setAbaAtiva('painel')}} className="btn-mini">✏️</button>
                                <button onClick={async () => { if(window.confirm(`Excluir ${p.nome}?`)) { await fetch(`${API_BASE}/Pessoa/${p.id}`, {method:'DELETE'}); fetchData(); } }} className="btn-mini">❌</button>
                            </div>
                        </div>
                        {isExp && (
                            <div className="individual-chart fade-in">
                                <Pie data={getChartData(p.id)} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }} />
                            </div>
                        )}
                    </div>
                );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
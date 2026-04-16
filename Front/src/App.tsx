import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- INTERFACES ---
interface Pessoa {
  id: string;
  nome: string;
  idade: number;
}

interface Categoria {
  id: string;
  descricao: string;
  finalidade: 'despesa' | 'receita' | 'ambas';
  ativo?: boolean;
}

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'despesa' | 'receita';
  pessoaId: string;
  categoriaId: string;
  pessoaNome?: string;
  categoriaDesc?: string;
}

const API_BASE = "http://localhost:5272/api";

const App: React.FC = () => {
  const [data, setData] = useState<{ transacoes: Transacao[], pessoas: Pessoa[], categorias: Categoria[] }>({
    transacoes: [], pessoas: [], categorias: []
  });
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'painel' | 'gestao'>('painel');
  const [pessoaExpandida, setPessoaExpandida] = useState<string | null>(null);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [relatorioPessoas, setRelatorioPessoas] = useState<any>(null);
  const [relatorioCategorias, setRelatorioCategorias] = useState<any>(null);

  // --- ESTADOS DE FORMULÁRIO ---
  const [formP, setFormP] = useState({ nome: '', idade: '' });
  const [editandoPessoaId, setEditandoPessoaId] = useState<string | null>(null);

  const [formC, setFormC] = useState({ descricao: '', finalidade: 'despesa' as 'despesa' | 'receita' | 'ambas' });
  const [editandoCategoriaId, setEditandoCategoriaId] = useState<string | null>(null);

  const [formT, setFormT] = useState({ desc: '', valor: '', tipo: 'despesa' as 'despesa' | 'receita', pId: '', cId: '' });

  // --- SINCRONIZAÇÃO COM API ---
  const fetchData = useCallback(async () => {
    try {
      const [resT, resP, resC] = await Promise.all([
        fetch(`${API_BASE}/Transacao`),
        fetch(`${API_BASE}/Pessoa`),
        fetch(`${API_BASE}/Categoria`)
      ]);
      setData({
        transacoes: await resT.json(),
        pessoas: await resP.json(),
        categorias: await resC.json()
      });
    } catch (err) {
      console.error("Erro na comunicação com a API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchRelatorios = async () => {
    try {
      const resP = await fetch(`${API_BASE}/Relatorio/totais-por-pessoa`);
      const dataP = await resP.json();
      setRelatorioPessoas(dataP);

      const resC = await fetch(`${API_BASE}/Relatorio/totais-por-categoria`);
      const dataC = await resC.json();
      setRelatorioCategorias(dataC);
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err);
    }
  };

  // --- LÓGICA DE NEGÓCIO: LANÇAMENTOS ---
  const pessoaSelecionada = useMemo(() =>
    data.pessoas.find(p => p.id === formT.pId),
    [data.pessoas, formT.pId]);

  const ehMenorDeIdade = pessoaSelecionada ? pessoaSelecionada.idade < 18 : false;

  // Regra: Se menor de idade, apenas despesa é permitida
  useEffect(() => {
    if (ehMenorDeIdade && formT.tipo === 'receita') {
      setFormT(prev => ({ ...prev, tipo: 'despesa' }));
    }
  }, [ehMenorDeIdade, formT.tipo]);

  // Regra: Restringir categorias pela finalidade (receita/despesa/ambas)
  const categoriasValidas = useMemo(() => {
    return data.categorias.filter(c => {
      const fin = (c.finalidade || (c as any).Finalidade || "").toLowerCase();
      const tipoT = formT.tipo.toLowerCase();
      return (fin === 'ambas' || fin === tipoT) && c.ativo !== false;
    });
  }, [data.categorias, formT.tipo]);

  // --- LÓGICA DE NEGÓCIO: TOTAIS ---
  const totaisPessoas = useMemo(() => {
    return data.pessoas.map(p => {
      const trans = data.transacoes.filter(t => (t.pessoaId || (t as any).PessoaId) === p.id);
      const rec = trans.filter(t => (t.tipo || (t as any).Tipo).toLowerCase() === 'receita')
        .reduce((s, t) => s + Number(t.valor || (t as any).Valor), 0);
      const des = trans.filter(t => (t.tipo || (t as any).Tipo).toLowerCase() === 'despesa')
        .reduce((s, t) => s + Number(t.valor || (t as any).Valor), 0);
      return { ...p, rec, des, saldo: rec - des, trans };
    });
  }, [data]);

  const totalGeral = useMemo(() => {
    return totaisPessoas.reduce((acc, curr) => ({
      r: acc.r + curr.rec, d: acc.d + curr.des, s: acc.s + curr.saldo
    }), { r: 0, d: 0, s: 0 });
  }, [totaisPessoas]);

  // --- HANDLERS ---
  const handleSalvarPessoa = async () => {
    if (!formP.nome || !formP.idade) return alert("Preencha todos os campos da pessoa.");

    // Montamos o corpo SEM o campo ID primeiro
    const pessoaPayload: any = {
      nome: formP.nome,
      idade: Number(formP.idade)
    };

    const url = editandoPessoaId ? `${API_BASE}/Pessoa/${editandoPessoaId}` : `${API_BASE}/Pessoa`;
    const metodo = editandoPessoaId ? 'PUT' : 'POST';

    // SÓ adicionamos o ID se for uma edição (PUT)
    if (editandoPessoaId) {
      pessoaPayload.id = editandoPessoaId;
    }

    try {
      const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pessoaPayload)
      });

      if (res.ok) {
        setFormP({ nome: '', idade: '' });
        setEditandoPessoaId(null);
        fetchData();
      } else {
        // Isso vai te mostrar exatamente qual campo o C# não gostou
        const erroDetalhado = await res.json();
        console.error("Erro da API:", erroDetalhado);
        alert("Erro ao salvar pessoa. Verifique o console para detalhes.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
    }
  };

  const handleExcluirPessoa = async (id: string) => {
    if (window.confirm("Atenção: Deletar esta pessoa removerá todas as suas transações. Confirmar?")) {
      await fetch(`${API_BASE}/Pessoa/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleSalvarCategoria = async () => {
    if (!formC.descricao.trim()) return alert("A descrição é obrigatória.");

    // DTO para a API
    const categoriaPayload: any = {
      descricao: formC.descricao,
      finalidade: formC.finalidade
    };

    const url = editandoCategoriaId ? `${API_BASE}/Categoria/${editandoCategoriaId}` : `${API_BASE}/Categoria`;

    // No PUT, o ID deve ser enviado no corpo
    if (editandoCategoriaId) categoriaPayload.id = editandoCategoriaId;

    try {
      const res = await fetch(url, {
        method: editandoCategoriaId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriaPayload)
      });

      if (res.ok) {
        setFormC({ descricao: '', finalidade: 'despesa' });
        setEditandoCategoriaId(null);
        fetchData(); // Atualiza a lista
      } else {
        alert("Erro ao processar categoria na API.");
      }
    } catch (error) {
      console.error("Falha na requisição:", error);
    }
  };

  const handleLançarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formT.valor || parseFloat(formT.valor) <= 0) return alert("Valor inválido.");
    if (!formT.pId || !formT.cId) return alert("Selecione a pessoa e a categoria.");

    // O segredo está aqui: Enviar EXATAMENTE o que a Model espera
    const transacaoPayload = {
      descricao: formT.desc,
      valor: parseFloat(formT.valor),
      tipo: formT.tipo,
      pessoaId: formT.pId,      // Deve bater com o nome na sua classe C#
      categoriaId: formT.cId    // Deve bater com o nome na sua classe C#
    };

    try {
      const res = await fetch(`${API_BASE}/Transacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transacaoPayload)
      });

      if (res.ok) {
        setFormT({ desc: '', valor: '', tipo: 'despesa', pId: '', cId: '' });
        fetchData();
      } else {
        // Tenta ler a mensagem de erro que o C# enviou
        const errorText = await res.text();
        console.error("Detalhes do erro 500:", errorText);
        alert("Erro 500 no servidor. Verifique o console do VS Code (Backend).");
      }
    } catch (err) {
      console.error("Erro na comunicação:", err);
    }
  };

  const handleExcluirCategoria = async (id: string) => {
    if (window.confirm("Deseja realmente excluir esta categoria? Esta ação pode falhar se houver lançamentos vinculados a ela.")) {
      try {
        const res = await fetch(`${API_BASE}/Categoria/${id}`, { method: 'DELETE' });

        if (res.ok) {
          fetchData();
        } else {
          // Se a API retornar 400 ou 500, geralmente é restrição de chave estrangeira no SQL
          alert("Não foi possível excluir: verifique se existem transações usando esta categoria.");
        }
      } catch (err) {
        console.error("Erro ao deletar categoria:", err);
      }
    }
  };

  if (loading) return <div className="loading-screen">FinanceFlow Systems...</div>;

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Finance<span>Flow</span></h1>
        <nav className="nav-tabs">
          <button className={abaAtiva === 'painel' ? 'active' : ''} onClick={() => setAbaAtiva('painel')}>Lançamentos</button>
          <button className={abaAtiva === 'gestao' ? 'active' : ''} onClick={() => setAbaAtiva('gestao')}>Gestão & Totais</button>
        </nav>
      </header>

      {abaAtiva === 'painel' ? (
        <main className="dashboard fade-in">
          <div className="main-layout">
            <aside className="sidebar">
              <div className="glass-card">
                <h3>Novo Lançamento</h3>
                <form className="form-ui" onSubmit={handleLançarTransacao}>
                  <input className="styled-input" placeholder="Descrição (Máx 400)" maxLength={400} value={formT.desc} onChange={e => setFormT({ ...formT, desc: e.target.value })} required />
                  <div className="form-row">
                    <input className="styled-input" type="number" step="0.01" placeholder="Valor R$" value={formT.valor} onChange={e => setFormT({ ...formT, valor: e.target.value })} required />
                    <select className="styled-input" value={formT.tipo} onChange={e => setFormT({ ...formT, tipo: e.target.value as any })} disabled={ehMenorDeIdade}>
                      <option value="despesa">Despesa</option>
                      {!ehMenorDeIdade && <option value="receita">Receita</option>}
                    </select>
                  </div>
                  <select className="styled-input" value={formT.pId} onChange={e => setFormT({ ...formT, pId: e.target.value })} required>
                    <option value="">Selecione a Pessoa</option>
                    {data.pessoas.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.idade} anos)</option>)}
                  </select>
                  <select className="styled-input" value={formT.cId} onChange={e => setFormT({ ...formT, cId: e.target.value })} required>
                    <option value="">Categoria por Finalidade</option>
                    {categoriasValidas.map(c => <option key={c.id} value={c.id}>{c.descricao}</option>)}
                  </select>
                  <button type="submit" className="btn-primary">Registrar Movimentação</button>
                </form>
              </div>
            </aside>
            <section className="glass-card content-area">
              <h3>Histórico Recente</h3>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Item / Categoria</th><th>Pessoa</th><th>Valor</th></tr></thead>
                  <tbody>
                    {data.transacoes.map(t => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{t.descricao}</span>
                            <small style={{ color: '#a855f7', fontWeight: 'bold' }}>{t.categoriaDesc || "Geral"}</small>
                          </div>
                        </td>
                        <td>{t.pessoaNome}</td>
                        <td className={(t.tipo || (t as any).Tipo).toLowerCase() === 'receita' ? 't-pos' : 't-neg'}>
                          R$ {Number(t.valor || (t as any).Valor).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      ) : (
        <main className="dashboard fade-in">
          <div className="main-layout">
            <aside className="sidebar">
              <div className="glass-card" style={{ marginBottom: '15px' }}>
                <h3>{editandoPessoaId ? '✏️ Editar Pessoa' : '👤 Nova Pessoa'}</h3>
                <div className="form-ui">
                  <input className="styled-input" placeholder="Nome (Máx 200)" maxLength={200} value={formP.nome} onChange={e => setFormP({ ...formP, nome: e.target.value })} />
                  <input className="styled-input" type="number" placeholder="Idade" value={formP.idade} onChange={e => setFormP({ ...formP, idade: e.target.value })} />
                  <button className="btn-primary" onClick={handleSalvarPessoa}>Salvar</button>
                  {editandoPessoaId && <button className="btn-link" onClick={() => { setEditandoPessoaId(null); setFormP({ nome: '', idade: '' }) }}>Cancelar</button>}
                </div>
              </div>
            </aside>

            <section className="content-area">
              <div className="glass-card" style={{ marginBottom: '15px' }}>
                <h3>Totais por Pessoa</h3>
                <table>
                  <thead><tr><th>Nome</th><th>Receitas</th><th>Despesas</th><th>Saldo</th><th>Ações</th></tr></thead>
                  <tbody>
                    {totaisPessoas.map(p => (
                      <React.Fragment key={p.id}>
                        <tr onClick={() => setPessoaExpandida(pessoaExpandida === p.id ? null : p.id)} style={{ cursor: 'pointer' }}>
                          <td>{p.nome} {pessoaExpandida === p.id ? '▼' : '▶'}</td>
                          <td className="t-pos">R$ {p.rec.toFixed(2)}</td>
                          <td className="t-neg">R$ {p.des.toFixed(2)}</td>
                          <td style={{ fontWeight: 'bold', color: p.saldo >= 0 ? '#00d2ff' : '#ff4747' }}>R$ {p.saldo.toFixed(2)}</td>
                          <td>
                            <button className="btn-mini" onClick={(e) => { e.stopPropagation(); setEditandoPessoaId(p.id); setFormP({ nome: p.nome, idade: p.idade.toString() }) }}>✏️</button>
                            <button className="btn-mini" onClick={(e) => { e.stopPropagation(); handleExcluirPessoa(p.id) }}>🗑️</button>
                          </td>
                        </tr>
                        {pessoaExpandida === p.id && (
                          <tr className="fade-in" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <td colSpan={5} style={{ padding: '10px' }}>
                              <strong>Movimentações:</strong>
                              {p.trans.map(m => (
                                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '4px 0', fontSize: '0.85rem' }}>
                                  <span>{m.descricao}</span>
                                  <span className={(m.tipo || (m as any).Tipo).toLowerCase() === 'receita' ? 't-pos' : 't-neg'}>R$ {Number(m.valor || (m as any).Valor).toFixed(2)}</span>
                                </div>
                              ))}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {relatorioPessoas && (
                      <div className="secao-relatorio">
                        <h2>Resumo por Pessoa</h2>
                        <table>
                          <thead>
                            <tr>
                              <th>Pessoa</th>
                              <th>Receitas</th>
                              <th>Despesas</th>
                              <th>Saldo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {relatorioPessoas.detalhes.map((p: any) => (
                              <tr key={p.nome}>
                                <td>{p.nome}</td>
                                <td style={{ color: 'green' }}>R$ {p.totalReceitas.toFixed(2)}</td>
                                <td style={{ color: 'red' }}>R$ {p.totalDespesas.toFixed(2)}</td>
                                <td style={{ fontWeight: 'bold' }}>R$ {p.saldo.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                              <td>TOTAL GERAL</td>
                              <td>R$ {relatorioPessoas.resumoGeral.totalReceitas.toFixed(2)}</td>
                              <td>R$ {relatorioPessoas.resumoGeral.totalDespesas.toFixed(2)}</td>
                              <td>R$ {relatorioPessoas.resumoGeral.saldoLiquido.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'rgba(168,85,247,0.1)', fontWeight: 'bold' }}>
                      <td>TOTAL LÍQUIDO GERAL</td>
                      <td className="t-pos">R$ {totalGeral.r.toFixed(2)}</td>
                      <td className="t-neg">R$ {totalGeral.d.toFixed(2)}</td>
                      <td colSpan={2} style={{ color: '#00d2ff' }}>R$ {totalGeral.s.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="glass-card" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>📁</span>
                    <h3 style={{ margin: 0 }}>Gestão de Categorias</h3>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 20px' }}
                    onClick={() => setMostrarCategorias(!mostrarCategorias)}
                  >
                    {mostrarCategorias ? "Fechar" : "Abrir Gerenciamento"}
                  </button>
                </div>

                {mostrarCategorias && (
                  <div className="fade-in">
                    {/* FORMULÁRIO DE CADASTRO (CRIAÇÃO) */}
                    <div className="form-ui" style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <h4 style={{ marginTop: 0, color: '#a855f7' }}>
                        {editandoCategoriaId ? 'Editar Categoria' : 'Nova Categoria'}
                      </h4>
                      <div className="form-row">
                        <input
                          className="styled-input"
                          placeholder="Descrição da Categoria (Ex: Alimentação, Salário...)"
                          maxLength={400}
                          value={formC.descricao}
                          onChange={e => setFormC({ ...formC, descricao: e.target.value })}
                        />
                        <select
                          className="styled-input"
                          value={formC.finalidade}
                          onChange={e => setFormC({ ...formC, finalidade: e.target.value as any })}
                        >
                          <option value="despesa">Despesa</option>
                          <option value="receita">Receita</option>
                          <option value="ambas">Ambas</option>
                        </select>
                        <button className="btn-primary" onClick={handleSalvarCategoria} style={{ width: '150px' }}>
                          {editandoCategoriaId ? 'Atualizar' : 'Adicionar'}
                        </button>
                        {editandoCategoriaId && (
                          <button className="btn-link" onClick={() => { setEditandoCategoriaId(null); setFormC({ descricao: '', finalidade: 'despesa' }) }}>
                            Cancelar
                          </button>
                        )}
                      </div>
                      <small style={{ color: 'rgba(255,255,255,0.5)' }}>
                        * O ID será gerado automaticamente pelo sistema. Máximo 400 caracteres.
                      </small>
                    </div>

                    {/* LISTAGEM DE CATEGORIAS */}
                    <div className="table-scroll">
                      <table className="styled-table">
                        <thead>
                          <tr>
                            <th>Descrição</th>
                            <th>Finalidade</th>
                            <th style={{ textAlign: 'center' }}>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.categorias.map(c => (
                            <tr key={c.id}>
                              <td>{c.descricao}</td>
                              <td>
                                <span className={`badge ${c.finalidade?.toLowerCase()}`}>
                                  {c.finalidade?.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button className="btn-mini" onClick={() => {
                                    setEditandoCategoriaId(c.id);
                                    setFormC({ descricao: c.descricao, finalidade: c.finalidade });
                                  }}>✏️</button>
                                  <button className="btn-mini btn-danger" onClick={() => handleExcluirCategoria(c.id)}>❌</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
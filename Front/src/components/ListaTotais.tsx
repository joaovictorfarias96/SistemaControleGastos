import React from 'react';

interface PessoaResumo {
  nome: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
}

interface Props {
  dados: PessoaResumo[];
  consolidado: {
    totalGeralReceitas: number;
    totalGeralDespesas: number;
    saldoLiquidoGeral: number;
  };
}

export const ListaTotais: React.FC<Props> = ({ dados, consolidado }) => {
  return (
    <div className="glass-card mt-2 fade-in">
      <div className="table-header">
        <h3>Consulta de Totais por Pessoa</h3>
      </div>
      
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((p, index) => (
              <tr key={index}>
                <td>{p.nome}</td>
                <td className="t-pos">R$ {p.totalReceitas.toLocaleString()}</td>
                <td className="t-neg">R$ {p.totalDespesas.toLocaleString()}</td>
                <td className={p.saldo >= 0 ? 't-pos' : 't-neg'}>
                  R$ {p.saldo.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
              <td><strong>TOTAL GERAL</strong></td>
              <td className="t-pos"><strong>R$ {consolidado.totalGeralReceitas.toLocaleString()}</strong></td>
              <td className="t-neg"><strong>R$ {consolidado.totalGeralDespesas.toLocaleString()}</strong></td>
              <td className={consolidado.saldoLiquidoGeral >= 0 ? 't-pos' : 't-neg'}>
                <strong>R$ {consolidado.saldoLiquidoGeral.toLocaleString()}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
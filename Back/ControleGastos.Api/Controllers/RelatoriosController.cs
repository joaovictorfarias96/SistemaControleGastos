using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Api.Data;
using ControleGastos.Api.Models;

namespace ControleGastos.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatorioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RelatorioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("totais-por-pessoa")]
        public async Task<IActionResult> GetTotaisPorPessoa()
        {
            var transacoes = await _context.Transacoes.ToListAsync();
            var pessoas = await _context.Pessoas.ToListAsync();

            var listagem = pessoas.Select(p => new {
                Nome = p.Nome,
                TotalReceitas = transacoes.Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
                TotalDespesas = transacoes.Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor),
                Saldo = transacoes.Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor) -
                        transacoes.Where(t => t.PessoaId == p.Id && t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor)
            }).ToList();

            var totalGeral = new
            {
                TotalReceitas = listagem.Sum(x => x.TotalReceitas),
                TotalDespesas = listagem.Sum(x => x.TotalDespesas),
                SaldoLiquido = listagem.Sum(x => x.Saldo)
            };

            return Ok(new { Detalhes = listagem, ResumoGeral = totalGeral });
        }

        [HttpGet("totais-por-categoria")]
        public async Task<IActionResult> GetTotaisPorCategoria()
        {
            var transacoes = await _context.Transacoes.ToListAsync();
            var categorias = await _context.Categorias.ToListAsync();

            var listagem = categorias.Select(c => new {
                Descricao = c.Descricao,
                TotalReceitas = transacoes.Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
                TotalDespesas = transacoes.Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor),
                Saldo = transacoes.Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor) -
                        transacoes.Where(t => t.CategoriaId == c.Id && t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor)
            }).ToList();

            var totalGeral = new
            {
                TotalReceitas = listagem.Sum(x => x.TotalReceitas),
                TotalDespesas = listagem.Sum(x => x.TotalDespesas),
                SaldoLiquido = listagem.Sum(x => x.Saldo)
            };

            return Ok(new { Detalhes = listagem, ResumoGeral = totalGeral });
        }
    }
}
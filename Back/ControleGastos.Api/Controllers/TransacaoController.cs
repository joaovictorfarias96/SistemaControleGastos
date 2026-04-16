using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Api.Data;
using ControleGastos.Api.Models;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransacaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTransacoes()
    {
        var transacoes = await _context.Transacoes
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .OrderByDescending(t => t.Id)
            .Select(t => new
            {
                Id = t.Id,
                Descricao = t.Descricao,
                Valor = t.Valor,
                Tipo = t.Tipo.ToString(),
                PessoaId = t.PessoaId,
                CategoriaId = t.CategoriaId,
                PessoaNome = t.Pessoa != null ? t.Pessoa.Nome : "N/A",
                CategoriaDesc = t.Categoria != null ? t.Categoria.Descricao : "Geral"
            })
            .ToListAsync();

        return Ok(transacoes);
    }

    [HttpPost]
    public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
    {
        var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
        var categoria = await _context.Categorias.FindAsync(transacao.CategoriaId);

        if (pessoa == null) return BadRequest("Pessoa não encontrada.");
        if (categoria == null) return BadRequest("Categoria não encontrada.");

        if (transacao.Valor <= 0) return BadRequest("O valor deve ser superior a zero.");

        if (pessoa.Idade < 18 && transacao.Tipo == TipoTransacao.Receita)
            return BadRequest("Menores de 18 anos só podem registrar Despesas.");

        if (transacao.Tipo == TipoTransacao.Despesa && categoria.Finalidade == Finalidade.Receita)
            return BadRequest("Categoria exclusiva para receitas.");

        if (transacao.Tipo == TipoTransacao.Receita && categoria.Finalidade == Finalidade.Despesa)
            return BadRequest("Categoria exclusiva para despesas.");

        // Limpa referências para evitar Erro 500 de tracking
        transacao.Pessoa = null;
        transacao.Categoria = null;

        if (transacao.Id == Guid.Empty) transacao.Id = Guid.NewGuid();

        _context.Transacoes.Add(transacao);

        try
        {
            await _context.SaveChangesAsync();

            // Em vez de CreatedAtAction, retornamos Ok com o objeto
            // Isso evita que o .NET tente gerar uma URL de rota que não existe
            return Ok(transacao);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro ao salvar no banco: {ex.InnerException?.Message ?? ex.Message}");
        }
    }
}
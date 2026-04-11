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
    public TransacaoController(AppDbContext context) => _context = context;

    // GET: api/Transacao (Essencial para o Front-end carregar a lista)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetTransacoes()
    {
        // Usamos o Include para trazer os nomes de Pessoa e Categoria junto
        return await _context.Transacoes
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .Select(t => new {
                t.Id,
                t.Descricao,
                t.Valor,
                t.Tipo,
                t.PessoaId,
                t.CategoriaId,
                PessoaNome = t.Pessoa != null ? t.Pessoa.Nome : "N/A",
                CategoriaDesc = t.Categoria != null ? t.Categoria.Descricao : "N/A"
            })
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Transacao>> GetTransacao(Guid id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);
        if (transacao == null) return NotFound();
        return transacao;
    }

    [HttpPost]
    public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
    {
        var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
        if (pessoa != null && pessoa.Idade < 18 && transacao.Tipo == "receita")
        {
            return BadRequest("Menores de 18 anos não podem registrar receitas.");
        }

        _context.Transacoes.Add(transacao);

        // CORREÇÃO AQUI: Adicionado o "Async" no final
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTransacao), new { id = transacao.Id }, transacao);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransacao(Guid id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);
        if (transacao == null) return NotFound();

        _context.Transacoes.Remove(transacao);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutTransacao(Guid id, Transacao transacao)
    {
        if (id != transacao.Id) return BadRequest();

        _context.Entry(transacao).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
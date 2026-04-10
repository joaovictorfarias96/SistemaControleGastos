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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> Get()
    {
        return await _context.Transacoes
            .Include(t => t.Pessoa)
            .Include(t => t.Categoria)
            .Select(t => new { t.Id, t.Descricao, t.Valor, t.Tipo, PessoaNome = t.Pessoa.Nome, CategoriaDesc = t.Categoria.Descricao })
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Transacao>> Post(Transacao transacao)
    {
        var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
        var categoria = await _context.Categorias.FindAsync(transacao.CategoriaId);

        if (pessoa == null || categoria == null) return BadRequest("Pessoa ou Categoria não encontrada.");

        // REGRA: Menor de 18 anos só pode despesa
        if (pessoa.Idade < 18 && transacao.Tipo.ToLower() == "receita")
            return BadRequest("Menores de 18 anos não podem ter receitas.");

        // REGRA: Validar Categoria vs Tipo
        if (transacao.Tipo.ToLower() == "despesa" && categoria.Finalidade.ToLower() == "receita")
            return BadRequest("Categoria incompatível com despesa.");

        if (transacao.Tipo.ToLower() == "receita" && categoria.Finalidade.ToLower() == "despesa")
            return BadRequest("Categoria incompatível com receita.");

        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();
        return Ok(transacao);
    }
    // DELETE: api/Transacao/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransacao(Guid id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);
        if (transacao == null) return NotFound();

        _context.Transacoes.Remove(transacao);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/Transacao/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> PutTransacao(Guid id, Transacao transacao)
    {
        if (id != transacao.Id) return BadRequest();

        // Aqui você deve repetir as validações de regra de negócio (Idade < 18 etc)
        // para garantir que ninguém edite um dado e quebre a regra!

        _context.Entry(transacao).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
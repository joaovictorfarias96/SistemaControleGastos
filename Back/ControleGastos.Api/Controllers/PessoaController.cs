using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Api.Data;
using ControleGastos.Api.Models;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PessoaController : ControllerBase
{
    private readonly AppDbContext _context;
    public PessoaController(AppDbContext context) => _context = context;

    // LISTAGEM
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pessoa>>> GetPessoas()
        => await _context.Pessoas.ToListAsync();

    // CRIAÇÃO
    [HttpPost]
    public async Task<ActionResult<Pessoa>> PostPessoa(Pessoa pessoa)
    {
        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPessoas), new { id = pessoa.Id }, pessoa);
    }

    // EDIÇÃO
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPessoa(Guid id, Pessoa pessoa)
    {
        if (id != pessoa.Id) return BadRequest("IDs divergentes.");

        _context.Entry(pessoa).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Pessoas.Any(e => e.Id == id)) return NotFound();
            throw;
        }
        return NoContent();
    }

    // DELEÇÃO
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePessoa(Guid id)
    {
        var pessoa = await _context.Pessoas
            .Include(p => p.Transacoes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pessoa == null) return NotFound();

        // Remove as transações associadas e a pessoa
        _context.Transacoes.RemoveRange(pessoa.Transacoes);
        _context.Pessoas.Remove(pessoa);

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
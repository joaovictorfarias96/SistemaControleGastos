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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pessoa>>> GetPessoas()
        => await _context.Pessoas.ToListAsync();

    [HttpPost]
    public async Task<ActionResult<Pessoa>> PostPessoa(Pessoa pessoa)
    {
        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();
        return Ok(pessoa);
    } // Chave que faltava aqui

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePessoa(Guid id)
    {
        var pessoa = await _context.Pessoas.FindAsync(id);
        if (pessoa == null) return NotFound();

        _context.Pessoas.Remove(pessoa);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutPessoa(Guid id, Pessoa pessoa)
    {
        if (id != pessoa.Id)
        {
            return BadRequest("O ID da URL não coincide com o ID do corpo.");
        }

        // MARCA O OBJETO COMO MODIFICADO PARA O ENTITY FRAMEWORK
        _context.Entry(pessoa).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PessoaExists(id)) return NotFound();
            else throw;
        }

        return NoContent(); // Retorno padrão para PUT de sucesso (204)
    }

    private bool PessoaExists(Guid id)
        => _context.Pessoas.Any(e => e.Id == id);
}
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleGastos.Api.Models;

public class Transacao
{
    public Guid Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Tipo { get; set; } = string.Empty; // receita ou despesa

    public Guid PessoaId { get; set; }
    // Adicione esta linha:
    public Pessoa? Pessoa { get; set; }

    public Guid CategoriaId { get; set; }
    // Adicione esta linha:
    public Categoria? Categoria { get; set; }
}
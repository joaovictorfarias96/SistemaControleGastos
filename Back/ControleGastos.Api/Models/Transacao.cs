using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleGastos.Api.Models;

public class Transacao
{
	[Key]
	public Guid Id { get; set; } = Guid.NewGuid();

	[Required]
	[MaxLength(400)]
	public string Descricao { get; set; } = string.Empty;

	[Required]
	[Range(0.01, double.MaxValue)] // Valor deve ser positivo
	public decimal Valor { get; set; }

	[Required]
	public string Tipo { get; set; } // "despesa" ou "receita"

	[Required]
	public Guid CategoriaId { get; set; }

	[ForeignKey("CategoriaId")]
	public Categoria? Categoria { get; set; }

	[Required]
	public Guid PessoaId { get; set; }

	[ForeignKey("PessoaId")]
	public Pessoa? Pessoa { get; set; }
}
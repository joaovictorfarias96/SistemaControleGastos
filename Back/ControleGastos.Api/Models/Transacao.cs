using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ControleGastos.Api.Models;

public enum TipoTransacao
{
    Despesa,
    Receita
}

public class Transacao
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid(); // Gerado automaticamente

    [Required]
    [MaxLength(400)] // Requisito: Tamanho máximo de 400
    public string Descricao { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser positivo.")] // Requisito: Número positivo
    public decimal Valor { get; set; }

    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public TipoTransacao Tipo { get; set; }

    [Required]
    public Guid PessoaId { get; set; }

    [Required]
    public Guid CategoriaId { get; set; }

    // Propriedades de Navegação
    public virtual Pessoa? Pessoa { get; set; }
    public virtual Categoria? Categoria { get; set; }
}
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // Adicione este using

namespace ControleGastos.Api.Models;

public class Pessoa
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    public int Idade { get; set; }

    [JsonIgnore] // Adicione isso para resolver o loop infinito do JSON
    public ICollection<Transacao>? Transacoes { get; set; }
}
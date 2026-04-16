using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.Models;

public class Pessoa
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid(); // Identificador único automático

    [Required]
    [MaxLength(200)] // Requisito: texto com tamanho máximo de 200
    public string Nome { get; set; } = string.Empty;

    [Required]
    public int Idade { get; set; }

    // Propriedade de navegação para as transações
    public virtual ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
}
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // Adicione este using

namespace ControleGastos.Api.Models;

public class Pessoa
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int Idade { get; set; }

    // Adicione esta linha para o relacionamento:
    public ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
}
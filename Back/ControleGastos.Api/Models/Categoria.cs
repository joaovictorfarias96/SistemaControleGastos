using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ControleGastos.Api.Models;

public enum Finalidade
{
    Despesa,
    Receita,
    Ambas
}

public class Categoria
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(400)]
    public string Descricao { get; set; } = string.Empty;

    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public Finalidade Finalidade { get; set; }

    // Adicionado para suportar a funcionalidade de Ocultar/Exibir (Soft Delete)
    // Definimos como true por padrão para que categorias novas já nasçam visíveis
    public bool Ativo { get; set; } = true;

    [JsonIgnore]
    public virtual ICollection<Transacao> Transacoes { get; set; } = new List<Transacao>();
}
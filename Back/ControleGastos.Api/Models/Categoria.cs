using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.Models;

public class Categoria
{
    public Guid Id { get; set; }

    // O "= string.Empty" resolve esse erro do construtor
    public string Descricao { get; set; } = string.Empty;
    public string Finalidade { get; set; } = string.Empty;
}
using System;
using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.Models;

public class Categoria
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(400)] // Requisito da especificação
    public string Descricao { get; set; } = string.Empty;

    [Required]
    public string Finalidade { get; set; } = string.Empty; // despesa, receita ou ambas
}
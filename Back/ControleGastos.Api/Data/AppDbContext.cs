using Microsoft.EntityFrameworkCore;
using ControleGastos.Api.Models; // Ajuste para o seu namespace

namespace ControleGastos.Api.Data; // Verifique se tem o ".Data" no final

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Pessoa> Pessoas { get; set; }
    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Transacao> Transacoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // 1. Configuração da Pessoa (Nome max 200)
        modelBuilder.Entity<Pessoa>(entity => {
            entity.Property(p => p.Nome).HasMaxLength(200).IsRequired();
        });

        // 2. Configuração da Categoria (Descrição max 400)
        modelBuilder.Entity<Categoria>(entity => {
            entity.Property(c => c.Descricao).HasMaxLength(400).IsRequired();
        });

        // 3. Configuração da Transação (Descrição max 400 + Cascade Delete)
        modelBuilder.Entity<Transacao>(entity => {
            entity.Property(t => t.Descricao).HasMaxLength(400).IsRequired();

            // Relacionamento: Se deletar a Pessoa, as Transações somem (Requisito do teste!)
            entity.HasOne(t => t.Pessoa)
                  .WithMany(p => p.Transacoes)
                  .HasForeignKey(t => t.PessoaId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
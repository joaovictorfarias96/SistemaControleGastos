using ControleGastos.Api.Data;
using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. Configura os Controladores e resolve o ciclo de JSON
builder.Services.AddControllers()
    .AddJsonOptions(options => {
        // ESSA LINHA ABAIXO É A QUE RESOLVE O ERRO 500 DE CICLO
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 2. Banco de Dados - SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Swagger e CORS
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// --- INÍCIO DO BLOCO DE INICIALIZAÇÃO E SEED ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Garante que o banco e as tabelas existam
        context.Database.EnsureCreated();

        // Seed de Categorias
        if (!context.Categorias.Any())
        {
            context.Categorias.AddRange(
                new Categoria { Id = Guid.NewGuid(), Descricao = "Aluguel/Moradia", Finalidade = Finalidade.Despesa },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Supermercado", Finalidade = Finalidade.Despesa },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Salário", Finalidade = Finalidade.Receita },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Lazer/Cinema", Finalidade = Finalidade.Ambas },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Freelance", Finalidade = Finalidade.Receita }
            );
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Erro ao inicializar o banco.");
    }
}

// 4. Pipeline de execução
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.Run();
using ControleGastos.Api.Data;
using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);



// 1. Configura os Controladores e resolve o ciclo de JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// 2. Banco de Dados - SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        builder => builder.WithOrigins("http://localhost:5173") // Porta padrão do Vite
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

// 1. Antes do var app = builder.Build();
builder.Services.AddCors(options => {
    options.AddPolicy("MinhaPolitica", builder => {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// --- INÍCIO DO BLOCO DE AUTOMATIZAÇÃO (SEED) ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Se não houver nenhuma categoria no banco, ele cria as padrões
        if (!context.Categorias.Any())
        {
            context.Categorias.AddRange(
                new Categoria { Id = Guid.NewGuid(), Descricao = "Aluguel/Moradia", Finalidade = "despesa" },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Supermercado", Finalidade = "despesa" },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Salário", Finalidade = "receita" },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Lazer/Cinema", Finalidade = "ambas" },
                new Categoria { Id = Guid.NewGuid(), Descricao = "Freelance", Finalidade = "receita" }
            );
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        // Log de erro caso algo falhe na criação
        Console.WriteLine($"Erro ao popular o banco: {ex.Message}");
    }
}
// --- FIM DO BLOCO DE AUTOMATIZAÇÃO ---

// Prossiga com o restante do Program.cs (app.UseSwagger, etc.)
app.UseSwagger();
app.UseSwaggerUI();
// ...


// 4. Pipeline de execução
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Comente se tiver problemas com SSL local
// app.UseHttpsRedirection(); 

app.UseAuthorization();
app.UseCors("AllowReact");
app.MapControllers();
app.UseCors("MinhaPolitica");

// 5. Inicialização automática do banco
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Erro ao criar o banco de dados.");
    }
}

app.Run();
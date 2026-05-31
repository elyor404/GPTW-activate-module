using System.Net.Http.Headers;
using GPTW.Plus.Api.Models;
using GPTW.Plus.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient<OpenAiImageService>(client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
    client.Timeout = TimeSpan.FromMinutes(15);

    var apiKey = builder.Configuration["OpenAI:ApiKey"];
    if (string.IsNullOrWhiteSpace(apiKey))
    {
        throw new InvalidOperationException("OpenAI:ApiKey is not configured in appsettings.json");
    }

    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", apiKey);
});

builder.Services.AddHttpClient<OpenAiImageService>(client =>
{
    client.BaseAddress = new Uri("https://api.openai.com/v1/");
    client.Timeout = TimeSpan.FromMinutes(5);

    var apiKey = builder.Configuration["OpenAI:ApiKey"];

    if (string.IsNullOrWhiteSpace(apiKey))
    {
        throw new InvalidOperationException(
            "OpenAI:ApiKey is not configured in appsettings.json");
    }

    client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", apiKey);
});
builder.Services.AddScoped<NanoBananaImageService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
app.UseStaticFiles();

app.MapPost("/api/images/generate", async (
    GenerateImageRequest request,
    OpenAiImageService openAiService,
    NanoBananaImageService nanoBananaService,
    CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Prompt))
        return Results.BadRequest("Prompt is required.");

    IImageGenerationService service = request.Provider switch
    {
        ImageProvider.OpenAI => openAiService,
        ImageProvider.NanoBanana => nanoBananaService,
        _ => throw new InvalidOperationException("Unsupported provider")
    };

    var result = await service.GenerateImageAsync(request, ct);

    return Results.Ok(result);
});

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("Health")
    .WithDescription("Health check endpoint");

app.Run();

using GPTW.Plus.Api.Models;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace GPTW.Plus.Api.Services;

public sealed class OpenAiImageService : IImageGenerationService
{
    private readonly HttpClient httpClient;
    private readonly IWebHostEnvironment env;
    private readonly GenerationHistoryStore history;

    public OpenAiImageService(HttpClient httpClient, IWebHostEnvironment env, GenerationHistoryStore history)
    {
        this.httpClient = httpClient;
        this.env = env;
        this.history = history;
    }

    public async Task<GenerateImageResponse> GenerateImageAsync(GenerateImageRequest request, CancellationToken ct)
    {
        var payload = new
        {
            model = request.Model ?? "gpt-image-2",
            prompt = request.Prompt,
            n = request.N,
            size = request.Size,
            quality = request.Quality
        };

        using var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        using var response = await httpClient.PostAsync("images/generations", content, ct);
        var raw = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"OpenAI error: {(int)response.StatusCode} {response.ReasonPhrase}\n{raw}");
        }

        var openAiResponse = JsonSerializer.Deserialize<OpenAiImagesResponse>(
        raw,
        new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
        ?? throw new InvalidOperationException("Failed to parse OpenAI response.");

        var firstImage = openAiResponse.Data.FirstOrDefault()
            ?? throw new InvalidOperationException("OpenAI returned no image data.");

        if (string.IsNullOrWhiteSpace(firstImage.B64Json))
            throw new InvalidOperationException("OpenAI response did not include base64 image data.");

        var bytes = Convert.FromBase64String(firstImage.B64Json);

        var fileId = Guid.NewGuid().ToString("N");
        var fileName = $"{fileId}.png";
        var folder = Path.Combine(env.WebRootPath ?? "wwwroot", "generated");
        var stopwatch = Stopwatch.StartNew();

        Directory.CreateDirectory(folder);

        var fullPath = Path.Combine(folder, fileName);
        await File.WriteAllBytesAsync(fullPath, bytes, ct);

        history.Add(new GenerationRecord(
        Id: fileId,
        Prompt: request.Prompt,
        Provider: "OpenAI",
        Model: request.Model ?? "gpt-image-2",
        GenerationTimeMs: stopwatch.ElapsedMilliseconds,
        EstimatedCost: 0.04m,
        ImageUrl: $"https://localhost:7210/generated/{fileName}",
        CreatedAt: DateTime.UtcNow
        ));

        return new GenerateImageResponse(
            ImageId: fileId,
            Provider: "OpenAI",
            Model: request.Model ?? "gpt-image-2",
            Prompt: request.Prompt,
            FileName: fileName,
            PublicUrl: $"https://localhost:7210/generated/{fileName}"
        );
    }
}
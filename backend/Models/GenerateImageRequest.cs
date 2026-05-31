namespace GPTW.Plus.Api.Models;

public sealed record GenerateImageRequest(
    ImageProvider Provider,
    string Prompt,
    string? Size = "1024x1024",
    string? Quality = "medium",
    int N = 1,
    string? Model = null);

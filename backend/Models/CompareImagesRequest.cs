namespace GPTW.Plus.Api.Models;

public sealed record CompareImagesRequest(
    string Prompt,
    string? Size = "1024x1024",
    string? Quality = "medium");
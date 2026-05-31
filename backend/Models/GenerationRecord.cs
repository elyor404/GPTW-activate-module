namespace GPTW.Plus.Api.Models;

public sealed record GenerationRecord(
    string Id,
    string Prompt,
    string Provider,
    string Model,
    long GenerationTimeMs,
    decimal EstimatedCost,
    string ImageUrl,
    DateTime CreatedAt);
namespace GPTW.Plus.Api.Models;

public sealed record GenerateImageResponse(
    string ImageId,
    string Provider,
    string Model,
    string Prompt,
    string FileName,
    string PublicUrl);

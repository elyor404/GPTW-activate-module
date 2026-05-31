namespace GPTW.Plus.Api.Models;

public sealed record CompareImagesResponse(
    List<GenerateImageResponse> Results);
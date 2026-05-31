using GPTW.Plus.Api.Models;

namespace GPTW.Plus.Api.Services;

public interface IImageGenerationService
{
    Task<GenerateImageResponse> GenerateImageAsync(GenerateImageRequest request, CancellationToken ct);
}

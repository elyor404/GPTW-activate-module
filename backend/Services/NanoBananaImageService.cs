using GPTW.Plus.Api.Models;

namespace GPTW.Plus.Api.Services;

public sealed class NanoBananaImageService : IImageGenerationService
{
    public async Task<GenerateImageResponse> GenerateImageAsync(
        GenerateImageRequest request,
        CancellationToken ct)
    {
        await Task.Delay(1500, ct);

        var fileId = Guid.NewGuid().ToString("N");

        return new GenerateImageResponse(
            ImageId: fileId,
            Provider: "NanoBanana",
            Model: "nanobanana-v1",
            Prompt: request.Prompt,
            FileName: "mock-image.png",
            PublicUrl: "https://placehold.co/1024x1024/png"
        );
    }
}
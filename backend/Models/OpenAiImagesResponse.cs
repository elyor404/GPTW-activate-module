using System.Text.Json.Serialization;

namespace GPTW.Plus.Api.Models;

public sealed class OpenAiImagesResponse
{
    [JsonPropertyName("created")]
    public long Created { get; set; }

    [JsonPropertyName("data")]
    public List<OpenAiImageItem> Data { get; set; } = new();
}

public sealed class OpenAiImageItem
{
    [JsonPropertyName("b64_json")]
    public string? B64Json { get; set; }

    [JsonPropertyName("revised_prompt")]
    public string? RevisedPrompt { get; set; }

    [JsonPropertyName("url")]
    public string? Url { get; set; }
}

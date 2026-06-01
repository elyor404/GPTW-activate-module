using System.Text;
using System.Text.Json;

namespace GPTW.Plus.Api.Services;

public sealed class OpenAiTextService
{
    private readonly HttpClient httpClient;

    public OpenAiTextService(HttpClient httpClient)
    {
        this.httpClient = httpClient;
    }

    public async Task<string> GenerateMarketingTextAsync(
        string brief,
        CancellationToken ct)
    {
        var payload = new
        {
            model = "gpt-4.1-mini",
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content =
                        """
                        You are a professional workplace branding copywriter.

                        Generate:
                        - short marketing slogans
                        - workplace celebration text
                        - LinkedIn banner wording
                        - employee culture messaging

                        Keep responses concise and professional.
                        Return only the generated text.
                        """
                },
                new
                {
                    role = "user",
                    content = brief
                }
            },
            temperature = 0.8
        };

        using var content = new StringContent(
            JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json");

        using var response = await httpClient.PostAsync(
            "chat/completions",
            content,
            ct);

        var raw = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Text generation failed: {raw}");
        }

        using var document = JsonDocument.Parse(raw);

        var generatedText =
            document.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

        return generatedText?.Trim()
            ?? "Failed to generate text.";
    }
}
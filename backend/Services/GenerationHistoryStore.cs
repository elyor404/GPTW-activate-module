using GPTW.Plus.Api.Models;

namespace GPTW.Plus.Api.Services;

public sealed class GenerationHistoryStore
{
    private readonly List<GenerationRecord> _records = new();

    public void Add(GenerationRecord record)
    {
        _records.Add(record);
    }

    public List<GenerationRecord> GetAll()
    {
        return _records
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }
}
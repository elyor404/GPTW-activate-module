# GPTW Plus API - Backend

Web API for the GPTW Plus Activate module with AI image generation capabilities.

## Prerequisites

- .NET 8 SDK or later
- OpenAI API key

## Setup

### 1. Configure OpenAI API Key

Create or update `appsettings.Development.json`:

```json
{
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here"
  }
}
```

### 2. Install Dependencies

```bash
dotnet restore
```

### 3. Run the API

```bash
dotnet run
```

The API will start on `http://localhost:5000` and Swagger UI will be available at `http://localhost:5000/swagger`.

## API Endpoints

### Health Check
- **GET** `/health` - Returns API health status

### Image Generation
- **POST** `/api/activate/image-generation` - Generate an image using OpenAI

**Request body:**
```json
{
  "prompt": "A professional workplace culture image",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1,
  "model": "gpt-4o"
}
```

**Response:**
```json
{
  "imageId": "abc123def456",
  "model": "gpt-4o",
  "prompt": "A professional workplace culture image",
  "fileName": "abc123def456.png",
  "publicUrl": "/generated/abc123def456.png",
  "base64": "iVBORw0KGgoAAAANS..."
}
```

## Generated Images

Generated images are stored in `wwwroot/generated/` and accessible via `/generated/{fileName}` URL.

## CORS Configuration

Frontend is configured to access this API from `http://localhost:4200`.

## Project Structure

```
backend/
├── Models/                 # DTOs and domain models
├── Services/               # Business logic and integrations
├── Properties/            # Project properties
├── wwwroot/              # Static files and generated images
├── Program.cs            # Main application entry point
├── appsettings.json      # Configuration
└── README.md             # This file
```

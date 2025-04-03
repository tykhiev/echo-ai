# Echo AI API

A FastAPI-based REST API built with PyNest framework for Echo AI services.

## Prerequisites

- Python 3.12 or higher
- Poetry package manager

## Installation

1. Go to backend directory
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
poetry shell
```

3. Install dependencies:
```bash
poetry install
```

## Running the Application

You can run the application in two ways:

### 1. Using Python directly:
```bash
poetry run python main.py
```

### 2. Using Uvicorn directly:
```bash
uvicorn src.app_module:http_server --host 0.0.0.0 --port 8000 --reload
```

The server will start at `http://localhost:8000`

## API Documentation

Once the application is running, you can access:

- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

### Root Endpoint
- `GET /` - Get application information

### Voice Endpoints
- `GET /voice` - Get all voices
- `POST /voice` - Add a new voice
  ```json
  {
    "name": "string"
  }
  ```

## Project Structure
```bash
backend/
├── src/
│ ├── init.py
│ ├── app_controller.py
│ ├── app_module.py
│ ├── app_service.py
│ └── voice/
│ ├── init.py
│ ├── voice_controller.py
│ ├── voice_model.py
│ ├── voice_module.py
│ └── voice_service.py
├── main.py
├── pyproject.toml
├── poetry.lock
└── README.md
```

## Development

### Adding New Dependencies
```bash
poetry add package-name
```

### Running Tests
```bash
poetry run pytest
```

### Code Formatting
```bash
poetry run black .
```

## Environment Variables

Currently, no environment variables are required to run the application.



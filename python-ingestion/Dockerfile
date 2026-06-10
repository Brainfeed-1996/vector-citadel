FROM python:3.12-slim
WORKDIR /app
COPY python-ingestion/pyproject.toml ./
RUN pip install --no-cache-dir -e .
COPY python-ingestion/src ./src
CMD ["python", "-m", "ingestion.cli", "--demo"]
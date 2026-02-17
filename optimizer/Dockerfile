FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Optimizer is invoked via stdin/stdout by the server, not as a web service
CMD ["python", "main.py"]

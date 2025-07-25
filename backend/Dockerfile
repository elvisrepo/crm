# backend/Dockerfile

# 1. Use an official lightweight Python image
FROM python:3.10-slim

# 2. Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy and install dependencies
# This is done in a separate step to leverage Docker's layer caching.
COPY requirements.txt .
RUN pip install -r requirements.txt

# 5. Copy the rest of the application code into the container
COPY . .

# 6. Expose the port the app runs on
EXPOSE 8000

# 7. Define the default command to run when the container starts
# We run on 0.0.0.0 to make it accessible from outside the container.
CMD ["python", "manage.py", "runserver", "8001:8000"]
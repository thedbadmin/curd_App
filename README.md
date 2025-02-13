# Employee Management Application

A modern Employee Management System built with React, Node.js/Express, and MySQL, containerized using Docker.

## Features

- Create, Read, Update, and Delete employee records
- Employee information includes:
  - First Name
  - Last Name
  - Email
  - Phone Number
  - City
  - Department
  - Salary
- Modern and responsive UI
- Real-time feedback with success/error messages
- Data validation
- Containerized application using Docker

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### First Time Setup

1. Clone the repository
2. Navigate to the project directory
3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
   This command will:
   - Build all container images
   - Create and initialize the MySQL database
   - Start all services

### Regular Usage

After the initial setup, you can:

1. Start the application:
   ```bash
   docker-compose up
   ```

2. Stop the application:
   ```bash
   docker-compose down
   ```

3. Reset everything (including database):
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Important Notes

1. **First Start**: Wait about 30 seconds after starting containers for the database to fully initialize
2. **Database Persistence**: Data persists between restarts unless you use `docker-compose down -v`
3. **Troubleshooting**:
   - If the application fails to start, try `docker-compose down -v` followed by `docker-compose up --build`
   - Check logs with `docker-compose logs`
   - For specific service logs: `docker-compose logs [service]` (e.g., `docker-compose logs backend`)

## Application Structure

```
.
├── frontend/                # React frontend application
│   ├── src/                # Source files
│   │   ├── App.js          # Main React component
│   │   └── App.css         # Styles
│   ├── Dockerfile          # Frontend Docker configuration
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js/Express backend
│   ├── server.js           # Main server file
│   ├── Dockerfile         # Backend Docker configuration
│   └── package.json       # Backend dependencies
└── docker-compose.yml     # Docker Compose configuration
```

## API Endpoints

- GET `/api/employees` - Get all employees
- GET `/api/employees/:id` - Get a specific employee
- POST `/api/employees` - Create a new employee
- PUT `/api/employees/:id` - Update an existing employee
- DELETE `/api/employees/:id` - Delete an employee

## Development Notes

### Database Schema

```sql
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20),
  city VARCHAR(100),
  department VARCHAR(100),
  salary DECIMAL(10, 2),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Environment Variables

The application uses the following environment variables (with defaults):

```
DB_HOST=db
DB_USER=user
DB_PASSWORD=password
DB_NAME=cruddb
DB_PORT=3306
```

These are already configured in the `docker-compose.yml` file.

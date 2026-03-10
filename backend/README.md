# RecallAI Backend

AI-Powered Learning Retention Platform - Backend API

## 🚀 Features

- **User Authentication**: JWT-based secure authentication
- **Modular Architecture**: Clean, maintainable code structure
- **MongoDB Integration**: NoSQL database for flexible data storage
- **Password Security**: Bcrypt hashing for password protection
- **Token Management**: Access and refresh token system
- **Input Validation**: Pydantic schemas for data validation
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## 📋 Prerequisites

- Python 3.9+
- MongoDB 4.4+
- pip (Python package manager)

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirement.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Generate SECRET_KEY**
```bash
openssl rand -hex 32
# Copy the output and paste it in .env as SECRET_KEY
```

## 🏃‍♂️ Running the Application

1. **Start MongoDB**
```bash
# Make sure MongoDB is running
sudo systemctl start mongod  # Linux
# or
brew services start mongodb-community  # macOS
```

2. **Run the FastAPI server**
```bash
python main.py
```

3. **Access the API**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Profile
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

#### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <access_token>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

## 🏗️ Project Structure

```
backend/
├── main.py                 # Application entry point
├── requirement.txt         # Dependencies
├── .env.example           # Environment variables template
├── config/
│   └── database.py        # MongoDB configuration
├── core/
│   ├── config.py          # Application settings
│   ├── security.py        # Security utilities (JWT, passwords)
│   └── dependencies.py    # FastAPI dependencies
├── modules/
│   └── auth/
│       ├── auth_router.py     # API routes
│       ├── auth_controller.py # Request handlers
│       ├── auth_services.py   # Business logic
│       └── auth_schema.py     # Pydantic models
└── shared/
    └── utils/
        └── logger.py      # Logging configuration
```

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure access and refresh tokens
- **Token Expiration**: Configurable token lifetimes
- **Input Validation**: Strong password requirements
- **CORS Protection**: Configurable allowed origins

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SECRET_KEY | JWT secret key | - |
| MONGODB_URL | MongoDB connection string | mongodb://localhost:27017 |
| DATABASE_NAME | Database name | recallai |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token expiration | 30 |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token expiration | 7 |

## 🔄 Next Steps

- [ ] Implement refresh token endpoint
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add rate limiting
- [ ] Set up logging to files
- [ ] Create user module
- [ ] Create learning module
- [ ] Create quiz module
- [ ] Create revision module
- [ ] Integrate AI (Gemini/OpenAI)

## 📄 License

This project is part of RecallAI learning platform.

## 👥 Contributing

1. Follow the modular architecture pattern
2. Write clean, documented code
3. Add tests for new features
4. Update README for API changes

---

Built with ❤️ using FastAPI

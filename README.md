# 🌱 Carbon AI Job Scheduler
![homepage](https://github.com/user-attachments/assets/998a859b-b934-46a2-bb88-05d0abd43668)


## Overview
Carbon AI Job Scheduler is an intelligent task scheduling system that optimizes computing workloads to minimize carbon emissions. By leveraging real-time carbon intensity data and multiple AI services, it provides smart scheduling recommendations and detailed environmental impact analysis for resource-intensive computing tasks.

## ✨ Features

- **Intelligent Task Scheduling**
  - Real-time carbon intensity monitoring
  - AI-powered scheduling recommendations
  - Priority-based task queuing
  - Dependency management for complex workflows

- **Environmental Impact Analysis**
  - Real-time carbon intensity tracking
  - Projected carbon savings calculations
  - Cost savings estimates
  - Alternative scheduling windows

- **Advanced Analytics**
  - Interactive data visualization
  - Historical trend analysis
  - Carbon impact forecasting
  - Resource usage optimization

- **Robust Architecture**
  - RESTful API endpoints
  - WebSocket real-time updates
  - Database persistence
  - Error handling and fallbacks

## 🛠️ Technologies Used

### Frontend
- **Core**
  - React.js
  - Material-UI (MUI)
  - Emotion for styled components
  - Framer Motion for animations

- **Data Visualization**
  - Recharts
  - Date-fns for time manipulation

### Backend
- **Core Framework**
  - FastAPI
  - Uvicorn ASGI server
  - Pydantic for data validation

- **Database**
  - SQLAlchemy ORM
  - PostgreSQL
  - Alembic for migrations

- **AI/ML Integration**
  - OpenAI API client
  - Groq API integration
  - Perplexity AI

### External APIs
- **WattTime API**
  - Real-time grid carbon intensity
  - Regional power grid data
  - Historical emissions data

- **Groq API**
  - LLM inference
  - Task analysis
  - Scheduling optimization

- **Perplexity AI**
  - Dynamic insights generation
  - Environmental impact analysis
  - Resource optimization recommendations

### DevOps & Tools
- **Version Control**
  - Git
  - GitHub

- **Development**
  - Python 3.x
  - Node.js
  - npm/yarn

## 🚀 Setup Instructions

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/carbon-ai-job-scheduler.git
cd carbon-ai-job-scheduler
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Add your API keys:
# PERPLEXITY_API_KEY=
# GROQ_API_KEY=
# WATTTIME_USERNAME=
# WATTTIME_PASSWORD=

# Initialize database
alembic upgrade head

# Start the backend server
uvicorn main:app --reload
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WattTime for providing carbon intensity data
- Groq for AI inference capabilities
- Perplexity AI for insights generation
- The open-source community

# 🌱 Carbon AI Job Scheduler
![homepage](https://github.com/user-attachments/assets/998a859b-b934-46a2-bb88-05d0abd43668)
![Screenshot 2025-03-02 085922](https://github.com/user-attachments/assets/9bf8b5e4-1747-40a5-8a2e-cf219968cfc7)
![Screenshot 2025-03-02 090012](https://github.com/user-attachments/assets/db1ca293-33a3-4336-8eda-84789a3be772)


## Overview
Carbon AI Job Scheduler is an intelligent task scheduling system that optimizes computing workloads to minimize carbon emissions. By leveraging real-time carbon intensity data and multiple AI services, it provides smart scheduling recommendations and detailed environmental impact analysis for resource-intensive computing tasks.

## 🎨 User Interface

### Theme
- **Dark/Light Mode Toggle**
  - Seamless theme switching
  - System preference detection
  - Persistent theme selection
  - Material UI theme customization

### Main Tabs
1. **Jobs Dashboard**
   - Real-time job queue management
   - Task status monitoring
   - Cancel/Clear job operations
   - Job details and insights display

2. **Analytics Dashboard**
   - Carbon intensity trends
   - Savings visualization
   - Historical data analysis
   - Interactive charts and graphs

3. **Task Scheduling**
   - Intuitive task submission form
   - Resource usage specification
   - Duration and priority settings
   - Immediate scheduling feedback

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
  - Python 3.11
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

## 💫 UI Features

### Theme Customization
The application supports both light and dark modes, with smooth transitions between themes. Users can:
- Toggle between light and dark mode
- System theme detection

### Tab Navigation
1. **Jobs Tab**
   - View all scheduled tasks
   - Monitor job status in real-time
   - Cancel running jobs
   - Clear completed tasks
   - View detailed job insights

2. **Analytics Tab**
   - Carbon intensity graphs
   - Cost savings metrics
   - Environmental impact scores
   - Resource utilization charts
   - Historical trend analysis

3. **Schedule Tab**
   - Task submission interface
   - Resource specification
   - Priority selection
   - Duration setting
   - Real-time scheduling recommendations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WattTime for providing carbon intensity data
- Groq for AI inference capabilities
- Perplexity AI for insights generation
- The open-source community

---

Made with 💚 for a greener computing future

[⬆ back to top](#carbon-ai-job-scheduler)

# 🌱 Carbon Tracker

A modern, full-stack web application for tracking and analyzing your daily carbon footprint. Monitor your environmental impact through transportation, electricity usage, and dietary choices with beautiful visualizations and actionable insights.

![Carbon Tracker](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.112.2-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

## ✨ Features

### 📊 **Dashboard Analytics**
- Real-time carbon footprint visualization with interactive charts
- Daily, weekly, and monthly emission trends
- Eco-score tracking with goal-based insights
- Beautiful statistics cards with trend indicators

### 📝 **Activity Logging**
- Easy-to-use form for logging daily activities
- Transportation tracking (car, bus, train, bike, walking)
- Electricity consumption monitoring
- Diet-based emission calculations
- AI-powered suggestions for reducing your carbon footprint

### 📈 **Comprehensive Reports**
- Historical data analysis with sortable tables
- Emission breakdowns by category
- Progress tracking over time
- Export capabilities for data analysis

### 🎨 **Modern UI/UX**
- Clean, responsive design with Tailwind CSS
- Glass morphism effects and smooth animations
- Dark/light theme support
- Mobile-optimized interface
- Accessibility-focused design

## 🚀 Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library with latest features
- **Vite 7.1.2** - Lightning-fast build tool and dev server
- **Tailwind CSS 4.1.12** - Utility-first CSS framework
- **React Router 7.8.2** - Client-side routing
- **Recharts 3.1.2** - Interactive data visualization
- **Axios 1.11.0** - HTTP client for API communication

### Backend
- **FastAPI 0.112.2** - High-performance Python web framework
- **SQLAlchemy 2.0.32** - Modern ORM for database operations
- **Uvicorn 0.30.6** - Lightning-fast ASGI server
- **Pydantic 2.9.2** - Data validation and settings management
- **SQLite** - Lightweight database for data persistence

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.8 or higher)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/carbon-tracker.git
cd carbon-tracker
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.\.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```

The backend API will be available at `http://127.0.0.1:8000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd Frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## 📁 Project Structure

```
carbon-tracker/
├── 📂 backend/                 # FastAPI Backend
│   ├── 📂 app/
│   │   ├── 📄 main.py         # FastAPI application entry point
│   │   ├── 📄 database.py     # Database configuration
│   │   ├── 📄 models.py       # SQLAlchemy models
│   │   ├── 📄 schemas.py      # Pydantic schemas
│   │   └── 📄 logic.py        # Business logic & calculations
│   ├── 📄 requirements.txt    # Python dependencies
│   ├── 📄 carbon.db          # SQLite database
│   └── 📂 .venv/             # Virtual environment
├── 📂 Frontend/               # React Frontend
│   ├── 📂 src/
│   │   ├── 📂 pages/         # React components/pages
│   │   │   ├── 📄 Dashboard.jsx
│   │   │   ├── 📄 LogActivity.jsx
│   │   │   └── 📄 Reports.jsx
│   │   ├── 📂 lib/           # Utility functions
│   │   │   ├── 📄 api.js     # API client
│   │   │   ├── 📄 storage.js # Local storage utilities
│   │   │   └── 📄 emissions.js # Emission calculations
│   │   ├── 📄 App.jsx        # Main application component
│   │   ├── 📄 main.jsx       # Entry point
│   │   └── 📄 index.css      # Global styles
│   ├── 📄 package.json       # Node.js dependencies
│   ├── 📄 tailwind.config.js # Tailwind CSS configuration
│   └── 📄 vite.config.js     # Vite configuration
└── 📄 README.md              # This file
```

## 🔧 API Endpoints

### Carbon Footprint Calculation
- **POST** `/compute` - Calculate emissions for given activities
- **POST** `/logs` - Save activity log to database
- **GET** `/logs` - Retrieve all saved activity logs

### API Documentation
Visit `http://127.0.0.1:8000/docs` for interactive API documentation powered by Swagger UI.

## 🌍 Carbon Emission Factors

The application uses scientifically-backed emission factors:

| Category | Factor | Unit |
|----------|---------|------|
| **Transportation** |  |  |
| Car | 0.21 | kg CO₂/km |
| Bus | 0.10 | kg CO₂/km |
| Train | 0.05 | kg CO₂/km |
| Bike/Walk | 0.00 | kg CO₂/km |
| **Electricity** | 0.82 | kg CO₂/kWh |
| **Diet** |  |  |
| Vegan | 1.5 | kg CO₂/day |
| Vegetarian | 2.0 | kg CO₂/day |
| Mixed | 3.0 | kg CO₂/day |
| Non-vegetarian | 5.0 | kg CO₂/day |

## 📊 Features in Detail

### Eco-Score Calculation
The eco-score is calculated based on a daily target of 10 kg CO₂ emissions:
```
Eco Score = max(0, min(100, 100 - (total_emissions / 10) * 100))
```

### Smart Recommendations
The application provides personalized tips based on your usage patterns:
- Transportation optimization suggestions
- Energy efficiency recommendations
- Dietary impact reduction tips
- Weekly emission reduction goals

## 🚀 Development

### Frontend Development
```bash
cd Frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

### Backend Development
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database Schema
The application uses SQLite with the following main table:

```sql
CREATE TABLE logs (
    id INTEGER PRIMARY KEY,
    date TEXT,
    travel_km REAL,
    travel_mode TEXT,
    electricity_kwh REAL,
    diet TEXT,
    travel_kg REAL,
    electricity_kg REAL,
    food_kg REAL,
    total_kg REAL
);
```

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Data export (CSV, PDF)
- [ ] Social sharing of achievements
- [ ] Goal setting and tracking
- [ ] Integration with IoT devices
- [ ] Mobile app development
- [ ] Advanced analytics and insights
- [ ] Carbon offset marketplace integration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [React](https://reactjs.org/) for the powerful UI library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for beautiful data visualizations
- Environmental data sources for emission factors



<div align="center">
  <p><strong>Making the world greener, one step at a time 🌱</strong></p>
  <p>Built with ❤️ for a sustainable future</p>
</div>

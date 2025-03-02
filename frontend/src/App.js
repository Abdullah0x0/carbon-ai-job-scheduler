import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Paper, 
  Tabs, 
  Tab,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  CssBaseline
} from '@mui/material';
import { green } from '@mui/material/colors';
import TaskForm from './components/TaskForm';
import Timeline from './components/Timeline';
import DataAnalysis from './components/DataAnalysis';
import { soundManager } from './utils/sounds';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: green[700],
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h3: {
      fontWeight: 600,
      fontSize: '2.2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    subtitle1: {
      fontSize: '1.1rem',
      color: 'rgba(0, 0, 0, 0.7)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSchedule = async (taskData) => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await response.json();
      setScheduleData(data);
    } catch (error) {
      console.error("Error scheduling task:", error);
    }
    setLoading(false);
  };

  const handleTabChange = (event, newValue) => {
    soundManager.play('submit');
    setTabIndex(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        py: 4,
        background: 'linear-gradient(180deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0) 100%)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                mb: 2,
                background: 'linear-gradient(45deg, #2E7D32 30%, #1976D2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Carbon-Aware AI Job Scheduler
            </Typography>
            <Typography variant="subtitle1" sx={{ maxWidth: 600, mx: 'auto' }}>
              Optimize your compute tasks for minimal environmental impact with our intelligent scheduling system
            </Typography>
          </Box>

          <Paper 
            elevation={isMobile ? 2 : 4} 
            sx={{ 
              p: { xs: 2, sm: 4 },
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Tabs 
              value={tabIndex} 
              onChange={handleTabChange} 
              centered 
              sx={{ 
                mb: 4,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label="Schedule Task" />
              <Tab label="Carbon Analysis" />
            </Tabs>

            {tabIndex === 0 && (
              <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <TaskForm onSchedule={handleSchedule} />
                {loading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress size={40} thickness={4} />
                  </Box>
                )}
                {scheduleData && <Timeline data={scheduleData} />}
              </Box>
            )}

            {tabIndex === 1 && (
              <DataAnalysis analysis={scheduleData ? scheduleData.analysis : null} />
            )}
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              &copy; 2025 Carbon AI Scheduler • Making computing greener, one task at a time
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Paper, 
  Tabs, 
  Tab,
  IconButton,
  useMediaQuery
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { green } from '@mui/material/colors';
import TaskForm from './components/TaskForm';
import Timeline from './components/Timeline';
import DataAnalysis from './components/DataAnalysis';
import { soundManager } from './utils/sounds';
import { useTheme } from './theme/ThemeContext';

function App() {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { isDarkMode, toggleTheme } = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

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
    <Box sx={{ 
      minHeight: '100vh',
      py: 4,
      background: isDarkMode 
        ? 'linear-gradient(180deg, rgba(18,18,18,0.8) 0%, rgba(18,18,18,1) 100%)'
        : 'linear-gradient(180deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0) 100%)'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
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
            background: isDarkMode 
              ? 'rgba(30, 30, 30, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
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
  );
}

export default App;

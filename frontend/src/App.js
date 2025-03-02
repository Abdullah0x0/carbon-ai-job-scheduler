// src/App.js
import React, { useState } from 'react';
import { Container, Typography, Box, CircularProgress, Paper } from '@mui/material';
import TaskForm from './components/TaskForm';
import Timeline from './components/Timeline';

function App() {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSchedule = async (taskData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/schedule', {
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

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Carbon-Aware AI Job Scheduler
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          A smart assistant to schedule compute-heavy tasks for lower carbon emissions.
        </Typography>
        <TaskForm onSchedule={handleSchedule} />
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
        {scheduleData && <Timeline data={scheduleData} />}
      </Paper>
      <Box sx={{ mt: 4, mb: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          &copy; 2025 Abdullah & Ngoc. All rights reserved.
        </Typography>
      </Box>
    </Container>
  );
}

export default App;

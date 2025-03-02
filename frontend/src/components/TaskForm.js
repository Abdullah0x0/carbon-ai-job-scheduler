// src/components/TaskForm.js
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

function TaskForm({ onSchedule }) {
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState('');
  const [resourceUsage, setResourceUsage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule({
      task_name: taskName,
      duration_hours: parseFloat(duration),
      resource_usage: resourceUsage
    });
    setTaskName('');
    setDuration('');
    setResourceUsage('');
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <TextField
          label="Task Name"
          variant="outlined"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="e.g., Train ResNet model"
          required
        />
        <TextField
          label="Duration (hours)"
          variant="outlined"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 3"
          required
        />
        <TextField
          label="Resource Usage"
          variant="outlined"
          value={resourceUsage}
          onChange={(e) => setResourceUsage(e.target.value)}
          placeholder="e.g., GPU-heavy"
          required
        />
      </Box>
      <Button variant="contained" color="primary" type="submit" fullWidth>
        Get Schedule Recommendation
      </Button>
    </motion.form>
  );
}

export default TaskForm;

import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Card, 
  CardContent,
  Typography,
  InputAdornment,
  MenuItem,
  Tooltip,
  IconButton
} from '@mui/material';
import { motion } from 'framer-motion';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ComputerIcon from '@mui/icons-material/Computer';
import WorkIcon from '@mui/icons-material/Work';
import { soundManager } from '../utils/sounds';

const resourceOptions = [
  { value: 'low', label: 'Low (CPU only)' },
  { value: 'medium', label: 'Medium (CPU + RAM intensive)' },
  { value: 'high', label: 'High (GPU required)' },
  { value: 'very-high', label: 'Very High (Multiple GPUs)' }
];

function TaskForm({ onSchedule }) {
  const [taskName, setTaskName] = useState('');
  const [duration, setDuration] = useState('');
  const [resourceUsage, setResourceUsage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }
    if (!duration) {
      newErrors.duration = 'Duration is required';
    } else if (parseFloat(duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    if (!resourceUsage) {
      newErrors.resourceUsage = 'Resource usage is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      soundManager.play('submit');
      await onSchedule({
        task_name: taskName,
        duration_hours: parseFloat(duration),
        resource_usage: resourceUsage
      });
      soundManager.play('success');
      setTaskName('');
      setDuration('');
      setResourceUsage('');
      setErrors({});
    }
  };

  const handleFieldFocus = () => {
    soundManager.play('submit');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon color="primary" />
            Task Details
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                label="Task Name"
                variant="outlined"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onFocus={handleFieldFocus}
                error={!!errors.taskName}
                helperText={errors.taskName || 'Give your task a descriptive name'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                label="Duration"
                variant="outlined"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                onFocus={handleFieldFocus}
                error={!!errors.duration}
                helperText={errors.duration || 'Estimated task duration in hours'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ScheduleIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">hours</InputAdornment>
                  ),
                }}
                required
              />

              <TextField
                select
                label="Resource Usage"
                variant="outlined"
                value={resourceUsage}
                onChange={(e) => setResourceUsage(e.target.value)}
                onFocus={handleFieldFocus}
                error={!!errors.resourceUsage}
                helperText={errors.resourceUsage || 'Select the computational resources needed'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ComputerIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                required
              >
                {resourceOptions.map((option) => (
                  <MenuItem 
                    key={option.value} 
                    value={option.value}
                    onClick={() => soundManager.play('submit')}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                size="large"
                onClick={() => soundManager.play('submit')}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                Get Optimal Schedule
              </Button>
              <Tooltip title="Our AI will analyze carbon intensity data and suggest the most environmentally friendly time to run your task">
                <IconButton 
                  size="small"
                  onClick={() => soundManager.play('submit')}
                >
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default TaskForm;

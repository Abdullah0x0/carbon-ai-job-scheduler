import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { format } from 'date-fns';

const statusColors = {
  pending: 'warning',
  running: 'info',
  completed: 'success',
  failed: 'error',
  cancelled: 'default'
};

const statusIcons = {
  pending: <AccessTimeIcon />,
  running: <CircularProgress size={20} />,
  completed: <CheckCircleIcon />,
  failed: <ErrorIcon />,
  cancelled: <CancelIcon />
};

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Get API URL from environment or use relative path for production
  const getApiUrl = () => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}/api`;
  };

  const fetchJobs = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/jobs`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelJob = async (jobId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/jobs/${jobId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to cancel job');
      fetchJobs();
    } catch (err) {
      console.error('Error cancelling job:', err);
    }
  };

  const handleClearQueue = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/jobs/clear`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to clear job queue');
      }

      setOpenDialog(false);
      setError(null);
      await fetchJobs();
    } catch (err) {
      console.error('Error clearing job queue:', err);
      setError('Failed to clear job queue. Please try again.');
      setOpenDialog(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Job Queue
        </Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteSweepIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={jobs.length === 0}
        >
          Clear Queue
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Clear Job Queue</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear all jobs from the queue? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleClearQueue} color="error" variant="contained">
            Clear Queue
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>Task Name</TableCell>
              <TableCell>Duration (hours)</TableCell>
              <TableCell>Resource Usage</TableCell>
              <TableCell>Scheduled For</TableCell>
              <TableCell>Carbon Savings</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <Chip
                    icon={statusIcons[job.status]}
                    label={job.status.toUpperCase()}
                    color={statusColors[job.status]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{job.task_name}</TableCell>
                <TableCell>{job.duration_hours}</TableCell>
                <TableCell>{job.resource_usage}</TableCell>
                <TableCell>
                  {job.scheduled_time ? (
                    <Tooltip title={
                      `${job.confidence_score ? `Confidence: ${(job.confidence_score * 100).toFixed(1)}%\n` : ''}` +
                      `${job.reasoning || 'Optimizing for carbon efficiency'}\n\n` +
                      `${job.alternative_windows?.length ? 
                        'Alternative Windows:\n' + job.alternative_windows.map(w => 
                          `• ${format(new Date(w.start_time), 'MMM d, yyyy HH:mm')}` +
                          `${w.expected_intensity ? ` (${w.expected_intensity.toFixed(2)} gCO2/kWh)` : ''}`
                        ).join('\n')
                        : ''
                      }`
                    }>
                      <Chip
                        label={format(new Date(job.scheduled_time), 'MMM d, yyyy HH:mm')}
                        color={job.confidence_score > 0.7 ? "success" : "warning"}
                        size="small"
                      />
                    </Tooltip>
                  ) : (
                    <Chip
                      label="Not scheduled"
                      color="default"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {job.carbon_saved !== null && job.carbon_saved !== undefined ? (
                    <Tooltip title={
                      `Expected Carbon Intensity: ${job.expected_intensity !== null && job.expected_intensity !== undefined ? `${job.expected_intensity.toFixed(2)} gCO2/kWh` : 'Calculating...'}\n` +
                      `Baseline Intensity: ${job.carbon_intensity !== null && job.carbon_intensity !== undefined ? `${job.carbon_intensity.toFixed(2)} gCO2/kWh` : 'Calculating...'}`
                    }>
                      <Chip
                        label={`${job.carbon_saved.toFixed(2)} kg CO2`}
                        color="success"
                        size="small"
                        variant={job.carbon_saved > 0 ? "filled" : "outlined"}
                      />
                    </Tooltip>
                  ) : (
                    <Chip
                      label="Calculating..."
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(job.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  {job.status === 'pending' && (
                    <Tooltip title="Cancel Job">
                      <IconButton
                        size="small"
                        onClick={() => handleCancelJob(job.id)}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">
                    No jobs found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Jobs; 
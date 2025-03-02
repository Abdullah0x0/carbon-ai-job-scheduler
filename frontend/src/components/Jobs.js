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
    // Check if we're in development
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:8000/api';
    }
    // In production (Vercel)
    return 'https://carbon-ai-job-scheduler.onrender.com/api';
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
              <TableCell>Carbon Saved (gCO2)</TableCell>
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
                  {job.carbon_saved ? 
                    job.carbon_saved.toFixed(2) :
                    'N/A'
                  }
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
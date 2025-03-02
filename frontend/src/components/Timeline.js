// src/components/Timeline.js
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InfoIcon from '@mui/icons-material/Info';
import RecommendIcon from '@mui/icons-material/Recommend'; 
import AssignmentIcon from '@mui/icons-material/Assignment';
import { green } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

function Timeline({ data }) {
  const { task, carbon_data, recommendation, insights } = data;

  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h5" gutterBottom sx={{ mt: 3, color: '#009688', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon /> Schedule Recommendation
        </Typography>
        <Grid container spacing={3}>
          {/* Task Information */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AssignmentIcon sx={{ color: green[500] }} />
                  <Typography variant="h6">
                    Task Information
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Task:</strong> {task.task_name} ({task.duration_hours} hours)
                </Typography>
                <Typography variant="body1">
                  <strong>Current Carbon Intensity:</strong> {carbon_data.carbon_intensity} {carbon_data.unit}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendation */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <RecommendIcon sx={{ color: green[500] }} />
                  <Typography variant="h6">
                    Recommendation
                  </Typography>
                </Box>
                <Box sx={{ pl: 2, borderLeft: '4px solid #e0e0e0' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {recommendation.recommendation || recommendation.message}
                  </ReactMarkdown>
                </Box>

                {recommendation.expected_intensity && (
                  <Typography sx={{ mt: 2, fontWeight: 500 }}>
                    <strong>Expected Carbon Intensity:</strong> {recommendation.expected_intensity} {carbon_data.unit}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Insight */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <InfoIcon sx={{ color: green[500] }} />
                  <Typography variant="h6">
                    Insight
                  </Typography>
                </Box>
                <Box sx={{ pl: 2, borderLeft: '4px solid #e0e0e0' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {insights}
                  </ReactMarkdown>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </ThemeProvider>
  );
}

export default Timeline;

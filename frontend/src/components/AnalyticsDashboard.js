import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { green, blue, orange } from '@mui/material/colors';
import CO2Icon from '@mui/icons-material/Co2';
import SavingsIcon from '@mui/icons-material/Savings';
import ForestIcon from '@mui/icons-material/Forest';

const AnalyticsDashboard = ({ jobs }) => {
  const theme = useTheme();

  // Calculate cumulative metrics
  const totalCarbonSaved = jobs.reduce((acc, job) => acc + (job.carbon_saved || 0), 0);
  const totalCostSaved = jobs.reduce((acc, job) => acc + (job.sustainability_impact?.energy_cost_savings || 0), 0);
  const totalTreesEquivalent = jobs.reduce((acc, job) => acc + (job.sustainability_impact?.equivalent_trees_planted || 0), 0);

  // Prepare time series data
  const timeSeriesData = jobs.map(job => ({
    date: new Date(job.created_at).toLocaleDateString(),
    carbonSaved: job.carbon_saved || 0,
    costSaved: job.sustainability_impact?.energy_cost_savings || 0,
    treesEquivalent: job.sustainability_impact?.equivalent_trees_planted || 0,
  }));

  // Calculate success metrics
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const totalJobs = jobs.length;
  const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  const pieData = [
    { name: 'Completed', value: completedJobs },
    { name: 'Other', value: totalJobs - completedJobs },
  ];

  const COLORS = [green[500], theme.palette.grey[300]];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Environmental Impact Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: green[50] }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CO2Icon sx={{ fontSize: 40, color: green[500], mb: 1 }} />
              <Typography variant="h4" color={green[700]}>
                {totalCarbonSaved.toFixed(2)} kg
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total CO2 Saved
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: blue[50] }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SavingsIcon sx={{ fontSize: 40, color: blue[500], mb: 1 }} />
              <Typography variant="h4" color={blue[700]}>
                ${totalCostSaved.toFixed(2)}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Total Cost Savings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: orange[50] }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ForestIcon sx={{ fontSize: 40, color: orange[500], mb: 1 }} />
              <Typography variant="h4" color={orange[700]}>
                {totalTreesEquivalent.toFixed(1)}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Trees Equivalent/Year
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carbon Savings Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="carbonSaved"
                      stroke={green[500]}
                      fill={green[200]}
                      name="Carbon Saved (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Success Rate
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill={green[500]}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="h4" sx={{ color: green[700], mt: 2 }}>
                  {successRate.toFixed(1)}%
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Success Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Combined Impact Metrics
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="costSaved"
                      stroke={blue[500]}
                      name="Cost Savings ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="treesEquivalent"
                      stroke={orange[500]}
                      name="Trees Equivalent"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 
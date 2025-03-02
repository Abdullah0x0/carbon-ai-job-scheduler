import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  ToggleButton, 
  ToggleButtonGroup, 
  Card,
  CardContent,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer,
  LineChart, Line,
  Bar, BarChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import CO2Icon from '@mui/icons-material/Co2';
import SavingsIcon from '@mui/icons-material/Savings';
import { soundManager } from '../utils/sounds';

// Enhanced color palette with gradients
const COLORS = {
  primary: {
    main: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
    gradient: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)'
  },
  secondary: {
    main: '#1976D2',
    light: '#2196F3',
    dark: '#0D47A1',
    gradient: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)'
  },
  success: {
    main: '#00C853',
    light: '#69F0AE',
    gradient: 'linear-gradient(45deg, #00C853 30%, #69F0AE 90%)'
  },
  chart: {
    area: ['#4CAF50', '#81C784'],
    pie: ['#2E7D32', '#FF5252'],
    bar: ['#1976D2', '#2196F3']
  }
};

function DataAnalysis({ analysis }) {
  const [view, setView] = useState('carbon');
  const [chartType, setChartType] = useState('area');
  const theme = useTheme();
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
  useEffect(() => {
    if (analysis) {
      const targetPercentage = ((analysis.baseline_intensity - analysis.optimized_intensity) / analysis.baseline_intensity * 100);
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = targetPercentage / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= targetPercentage) {
          setAnimatedPercentage(targetPercentage);
          clearInterval(timer);
        } else {
          setAnimatedPercentage(start);
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [analysis]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      soundManager.play('submit');
      setView(newView);
    }
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      soundManager.play('submit');
      setChartType(newType);
    }
  };

  if (!analysis) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Run a task scheduling analysis to see insights
        </Typography>
      </Card>
    );
  }

  const costData = [
    { name: 'Potential Savings', value: analysis.money_saved },
    { name: 'Optimized Cost', value: analysis.optimized_intensity * 0.05 }
  ];

  const trendData = [
    { name: 'Baseline', value: analysis.baseline_intensity },
    { name: 'Optimized', value: analysis.optimized_intensity }
  ];

  const renderChart = () => {
    if (view === 'carbon') {
      switch (chartType) {
        case 'area':
          return (
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.chart.area[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.chart.area[1]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: 8,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                  formatter={(value) => [`${value} ${analysis.unit}`, 'Carbon Intensity']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS.chart.area[0]}
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          );
        case 'line':
          return (
            <ResponsiveContainer>
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: 8,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={COLORS.chart.area[0]} 
                  strokeWidth={2}
                  dot={{ fill: COLORS.chart.area[0], strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          );
        case 'bar':
          return (
            <ResponsiveContainer>
              <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: 8,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: 'none'
                  }}
                />
                <Bar dataKey="value" fill={COLORS.chart.bar[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          );
        default:
          return null;
      }
    } else {
      return (
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={costData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {costData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS.chart.pie[index]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: 8,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => `${value} ($${costData.find(item => item.name === value)?.value.toFixed(2)})`}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ mt: 4 }}>
        <Card sx={{ mb: 3, overflow: 'visible' }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: 2,
              mb: 4 
            }}>
              <Typography variant="h5" sx={{ 
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CO2Icon /> Carbon & Cost Analysis
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <ToggleButtonGroup
                  value={view}
                  exclusive
                  onChange={handleViewChange}
                  size="small"
                >
                  <ToggleButton 
                    value="carbon"
                    sx={{ 
                      '&.Mui-selected': { 
                        background: COLORS.primary.gradient,
                        color: 'white'
                      }
                    }}
                  >
                    Carbon
                  </ToggleButton>
                  <ToggleButton 
                    value="cost"
                    sx={{ 
                      '&.Mui-selected': { 
                        background: COLORS.primary.gradient,
                        color: 'white'
                      }
                    }}
                  >
                    Cost
                  </ToggleButton>
                </ToggleButtonGroup>

                {view === 'carbon' && (
                  <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={handleChartTypeChange}
                    size="small"
                  >
                    <ToggleButton value="area">
                      <Tooltip title="Area Chart">
                        <TimelineIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="line">
                      <Tooltip title="Line Chart">
                        <TimelineIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="bar">
                      <Tooltip title="Bar Chart">
                        <BarChartIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {/* Main Chart */}
              <Paper sx={{ 
                flex: 2, 
                minWidth: { xs: '100%', md: 500 }, 
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[2]
              }}>
                <Box sx={{ height: 400 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${view}-${chartType}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ height: '100%' }}
                    >
                      {renderChart()}
                    </motion.div>
                  </AnimatePresence>
                </Box>
              </Paper>

              {/* Stats Cards */}
              <Box sx={{ 
                flex: 1, 
                minWidth: { xs: '100%', md: 300 },
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}>
                {/* Reduction Circle */}
                <Paper sx={{ 
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: theme.shadows[2],
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" gutterBottom>
                    Carbon Reduction
                  </Typography>
                  <Box sx={{ 
                    position: 'relative',
                    width: 180,
                    height: 180,
                    margin: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: COLORS.primary.gradient,
                    borderRadius: '50%',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    color: 'white',
                    my: 2
                  }}>
                    <Typography variant="h3">
                      {animatedPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Reduction in Carbon Intensity
                  </Typography>
                </Paper>

                {/* Summary Stats */}
                <Paper sx={{ 
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: theme.shadows[2]
                }}>
                  <Typography variant="h6" gutterBottom>
                    Impact Summary
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Card sx={{ 
                      p: 2,
                      background: COLORS.primary.gradient,
                      color: 'white',
                      borderRadius: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CO2Icon />
                        <Box>
                          <Typography variant="body2">Carbon Saved</Typography>
                          <Typography variant="h6">
                            {analysis.carbon_difference} {analysis.unit}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                    <Card sx={{ 
                      p: 2,
                      background: COLORS.secondary.gradient,
                      color: 'white',
                      borderRadius: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SavingsIcon />
                        <Box>
                          <Typography variant="body2">Cost Savings</Typography>
                          <Typography variant="h6">
                            ${analysis.money_saved.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}

export default DataAnalysis;

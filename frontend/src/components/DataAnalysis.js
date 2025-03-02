import React, { useState } from 'react';
import { Box, Typography, Paper, ToggleButton, ToggleButtonGroup, Fade } from '@mui/material';
import { 
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

// Custom color palette
const COLORS = {
  primary: '#2E3B55',
  secondary: '#4CAF50',
  accent: '#FF6B6B',
  background: '#F8F9FA',
  text: '#2C3E50',
  success: '#00C853',
  warning: '#FFA000',
  chart: {
    area: ['#3498db', '#2980b9'],
    pie: ['#2ECC71', '#E74C3C']
  }
};

function DataAnalysis({ analysis }) {
  const [view, setView] = useState('carbon'); // 'carbon' or 'cost'
  
  if (!analysis) {
    return <Typography>No analysis data available.</Typography>;
  }

  const reductionPercentage = ((analysis.baseline_intensity - analysis.optimized_intensity) / analysis.baseline_intensity * 100);
  
  const costData = [
    { name: 'Savings', value: analysis.money_saved },
    { name: 'Optimized Cost', value: analysis.optimized_intensity * 0.05 }
  ];

  const trendData = [
    { name: 'Initial', value: analysis.baseline_intensity },
    { name: 'Optimized', value: analysis.optimized_intensity }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ 
        mt: 4, 
        bgcolor: COLORS.background, 
        borderRadius: 2,
        p: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ color: COLORS.text, fontWeight: 'bold' }}>
            Carbon & Cost Analysis
          </Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="carbon" sx={{ '&.Mui-selected': { bgcolor: COLORS.primary, color: 'white' }}}>
              Carbon
            </ToggleButton>
            <ToggleButton value="cost" sx={{ '&.Mui-selected': { bgcolor: COLORS.primary, color: 'white' }}}>
              Cost
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Main Visualization */}
          <Paper sx={{ 
            flex: 2, 
            minWidth: 300, 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2,
            transition: 'all 0.3s ease'
          }}>
            <Fade in={view === 'carbon'}>
              <Box sx={{ display: view === 'carbon' ? 'block' : 'none', height: 400 }}>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
                  Carbon Intensity Trend
                </Typography>
                <ResponsiveContainer>
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.chart.area[0]} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.chart.area[1]} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" stroke={COLORS.text} />
                    <YAxis stroke={COLORS.text} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 8 }}
                      formatter={(value) => [`${value} ${analysis.unit}`, 'Carbon Intensity']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={COLORS.chart.area[0]}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Fade>
            <Fade in={view === 'cost'}>
              <Box sx={{ display: view === 'cost' ? 'block' : 'none', height: 400 }}>
                <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
                  Cost Distribution
                </Typography>
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
                    <Tooltip 
                      formatter={(value) => `$${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 8 }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => `${value} ($${costData.find(item => item.name === value)?.value.toFixed(2)})`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Fade>
          </Paper>

          {/* Stats Panel */}
          <Paper sx={{ 
            flex: 1, 
            minWidth: 300, 
            p: 3,
            bgcolor: 'white',
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: COLORS.primary }}>
              Reduction Metrics
            </Typography>
            
            {/* Percentage Circle */}
            <Box sx={{ 
              textAlign: 'center', 
              my: 4,
              p: 3,
              borderRadius: '50%',
              width: 150,
              height: 150,
              margin: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: COLORS.primary,
              color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h4">
                {reductionPercentage.toFixed(1)}%
                <Typography variant="body2">Reduction</Typography>
              </Typography>
            </Box>

            {/* Summary Stats */}
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper sx={{ 
                p: 2, 
                bgcolor: COLORS.primary, 
                color: 'white',
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2">Carbon Reduction</Typography>
                <Typography variant="h6">
                  {analysis.carbon_difference} {analysis.unit}
                </Typography>
              </Paper>
              <Paper sx={{ 
                p: 2, 
                bgcolor: COLORS.success, 
                color: 'white',
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2">Money Saved</Typography>
                <Typography variant="h6">
                  ${analysis.money_saved.toFixed(2)}
                </Typography>
              </Paper>
            </Box>
          </Paper>
        </Box>
      </Box>
    </motion.div>
  );
}

export default DataAnalysis;

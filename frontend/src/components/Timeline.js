import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  Chip,
  IconButton,
  Collapse,
  LinearProgress,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import InfoIcon from '@mui/icons-material/Info';
import RecommendIcon from '@mui/icons-material/Recommend'; 
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CO2Icon from '@mui/icons-material/Co2';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { green, orange, red, blue } from '@mui/material/colors';
import { soundManager } from '../utils/sounds';
import { format } from 'date-fns';

function Timeline({ data }) {
  const [expandedSection, setExpandedSection] = useState('all');
  const theme = useTheme();
  
  const { task, carbon_data, recommendation, insights } = data;

  const getCarbonIntensityColor = (intensity) => {
    const value = parseFloat(intensity);
    if (value < 300) return green[500];
    if (value < 600) return orange[500];
    return red[500];
  };

  const currentIntensityColor = getCarbonIntensityColor(carbon_data.carbon_intensity);
  const expectedIntensityColor = recommendation.expected_intensity ? 
    getCarbonIntensityColor(recommendation.expected_intensity) : green[500];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const toggleSection = (section) => {
    soundManager.play('submit');
    setExpandedSection(expandedSection === section ? 'all' : section);
  };

  const renderExpandIcon = (section) => {
    const isExpanded = expandedSection === 'all' || expandedSection === section;
    return (
      <IconButton 
        size="small" 
        onClick={() => toggleSection(section)}
        sx={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.3s' }}
      >
        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ 
            color: theme.palette.primary.main, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mb: 3
          }}>
            <RecommendIcon /> AI-Powered Scheduling Analysis
          </Typography>

          <Grid container spacing={3}>
            {/* Task Information */}
            <Grid item xs={12}>
              <motion.div variants={cardVariants}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    transition: '0.3s',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h6">Task Details</Typography>
                      </Box>
                      {renderExpandIcon('task')}
                    </Box>

                    <Collapse in={expandedSection === 'all' || expandedSection === 'task'}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip 
                              icon={<AccessTimeIcon />} 
                              label={`${task.duration_hours} hours`}
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                            {task.task_name}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">
                              Current Carbon Intensity
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CO2Icon sx={{ color: currentIntensityColor }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                  {carbon_data.carbon_intensity} {carbon_data.unit}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={(carbon_data.carbon_intensity / 1000) * 100}
                                    sx={{ 
                                      flex: 1,
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: theme.palette.grey[200],
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: currentIntensityColor,
                                        borderRadius: 4,
                                      }
                                    }}
                                  />
                                  <Tooltip title={carbon_data.data_source === 'watttime' ? 'Real-time data from WattTime' : 'Simulated data'}>
                                    <Chip
                                      label={carbon_data.data_source === 'watttime' ? 'Real' : 'Simulated'}
                                      color={carbon_data.data_source === 'watttime' ? 'success' : 'warning'}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Collapse>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Recommendation */}
            <Grid item xs={12}>
              <motion.div variants={cardVariants}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    transition: '0.3s',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RecommendIcon sx={{ color: green[500] }} />
                        <Typography variant="h6">Recommendation</Typography>
                      </Box>
                      {renderExpandIcon('recommendation')}
                    </Box>

                    <Collapse in={expandedSection === 'all' || expandedSection === 'recommendation'}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 1,
                        bgcolor: 'rgba(76, 175, 80, 0.08)',
                        mb: 2
                      }}>
                        <Typography variant="body1" gutterBottom>
                          {recommendation.reasoning || 'Optimizing for carbon efficiency'}
                        </Typography>

                        {/* Sustainability Impact Section */}
                        {recommendation.sustainability_impact && (
                          <Box sx={{ mt: 3, mb: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.15)', borderRadius: 2 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: green[700], fontWeight: 500 }}>
                              Environmental Impact
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                  <Typography variant="h4" sx={{ color: green[500] }}>
                                    {recommendation.sustainability_impact.carbon_reduction_percentage}%
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Carbon Reduction
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                  <Typography variant="h4" sx={{ color: green[500] }}>
                                    {recommendation.sustainability_impact.equivalent_trees_planted}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Trees Equivalent/Year
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                  <Typography variant="h4" sx={{ color: green[500] }}>
                                    ${recommendation.sustainability_impact.energy_cost_savings}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Cost Savings
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                          <Tooltip title="Scheduled Start Time">
                            <Chip
                              icon={<AccessTimeIcon />}
                              label={format(new Date(recommendation.recommended_start_time), 'MMM d, yyyy HH:mm')}
                              color="primary"
                              size="small"
                            />
                          </Tooltip>
                          
                          <Tooltip title="Combined AI Confidence">
                            <Chip
                              label={`${(recommendation.confidence_score * 100).toFixed(1)}% Confidence`}
                              color={recommendation.confidence_score > 0.7 ? "success" : "warning"}
                              size="small"
                            />
                          </Tooltip>
                          
                          <Tooltip title="Estimated Carbon Savings">
                            <Chip
                              icon={<CO2Icon />}
                              label={`${recommendation.carbon_savings_estimate.toFixed(2)} kg CO2 saved`}
                              color="success"
                              size="small"
                            />
                          </Tooltip>
                        </Box>
                        
                        {recommendation.alternative_windows?.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Alternative Windows:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {recommendation.alternative_windows.map((window, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={format(new Date(window.start_time), 'MMM d, yyyy HH:mm')}
                                    variant="outlined"
                                    size="small"
                                  />
                                  <Typography variant="body2" color="textSecondary">
                                    {window.reason || `Expected Intensity: ${window.expected_intensity.toFixed(2)} ${carbon_data.unit}`}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {recommendation.expected_intensity && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                          <Tooltip title="Expected Carbon Intensity">
                            <Chip
                              icon={<CO2Icon />}
                              label={`${recommendation.expected_intensity} ${carbon_data.unit}`}
                              sx={{ 
                                bgcolor: `${expectedIntensityColor}15`,
                                color: expectedIntensityColor,
                                '& .MuiChip-icon': { color: expectedIntensityColor }
                              }}
                            />
                          </Tooltip>
                          <Typography variant="body2" color="textSecondary">
                            Expected Carbon Intensity
                          </Typography>
                        </Box>
                      )}
                    </Collapse>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Insights */}
            <Grid item xs={12}>
              <motion.div variants={cardVariants}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 2,
                    transition: '0.3s',
                    '&:hover': { boxShadow: 3 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon sx={{ color: theme.palette.info.main }} />
                        <Typography variant="h6">Additional Insights</Typography>
                      </Box>
                      {renderExpandIcon('insights')}
                    </Box>

                    <Collapse in={expandedSection === 'all' || expandedSection === 'insights'}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 1,
                        bgcolor: 'rgba(33, 150, 243, 0.08)'
                      }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {insights}
                        </ReactMarkdown>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}

export default Timeline;

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    if (usersError) {
      console.error('Error fetching user count:', usersError);
    }

    // Get total API credentials
    const { count: totalCredentials, error: credentialsError } = await supabase
      .from('api_credentials')
      .select('*', { count: 'exact', head: true });

    if (credentialsError) {
      console.error('Error fetching credentials count:', credentialsError);
    }

    // Get total cost data entries
    const { count: totalCostEntries, error: costError } = await supabase
      .from('cost_data')
      .select('*', { count: 'exact', head: true });

    if (costError) {
      console.error('Error fetching cost entries count:', costError);
    }

    // Get total usage data entries
    const { count: totalUsageEntries, error: usageError } = await supabase
      .from('usage_data')
      .select('*', { count: 'exact', head: true });

    if (usageError) {
      console.error('Error fetching usage entries count:', usageError);
    }

    // Calculate total revenue (sum of all cost data)
    const { data: costData, error: costSumError } = await supabase
      .from('cost_data')
      .select('amount');

    let totalRevenue = 0;
    if (!costSumError && costData) {
      totalRevenue = costData.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    }

    // Calculate monthly growth (placeholder - would need historical data)
    const monthlyGrowth = 12.5; // Mock value for now

    // Get recent issues (placeholder - would come from logs/alerts)
    const issues = 3; // Mock value for now

    res.json({
      totalUsers: totalUsers || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      monthlyGrowth,
      issues
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/recent-activities
router.get('/activities', async (req, res) => {
  try {
    // Get recent user activities (placeholder data for now)
    const activities = [
      {
        id: 1,
        type: 'user_login',
        description: 'User logged in',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        user: req.user.name
      },
      {
        id: 2,
        type: 'api_call',
        description: 'API endpoint accessed',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        user: req.user.name
      },
      {
        id: 3,
        type: 'credential_created',
        description: 'New API credential created',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        user: req.user.name
      }
    ];

    res.json(activities);

  } catch (error) {
    console.error('Activities fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/charts/data
router.get('/charts/data', async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Generate mock chart data based on period
    let days = 7;
    switch (period) {
      case '24h':
        days = 1;
        break;
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 7;
    }

    const chartData = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      chartData.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 20, // Random value between 20-120
        label: date.toLocaleDateString()
      });
    }

    res.json({
      period,
      data: chartData,
      total: chartData.reduce((sum, item) => sum + item.value, 0),
      average: Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)
    });

  } catch (error) {
    console.error('Chart data fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const router = express.Router();

// All settings routes require authentication
router.use(authenticateToken);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // Return default settings if none exist
    const defaultSettings = {
      notifications: true,
      emailAlerts: true,
      theme: 'light',
      language: 'en',
      timezone: 'UTC'
    };

    res.json(settings || defaultSettings);

  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings
router.put('/', [
  body('notifications').optional().isBoolean(),
  body('emailAlerts').optional().isBoolean(),
  body('theme').optional().isIn(['light', 'dark']),
  body('language').optional().isString().isLength({ min: 2, max: 5 }),
  body('timezone').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const settings = req.body;

    // Upsert settings for user
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: req.user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    res.json(data);

  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings/password
router.put('/password', [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/settings/profile
router.get('/profile', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, status, last_login')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.last_login
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/settings/profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', req.user.id)
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'Email already taken' });
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...(name && { name }),
        ...(email && { email }),
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('id, name, email, role, status, last_login')
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.last_login
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
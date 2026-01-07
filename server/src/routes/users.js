const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users
router.get('/', requireRole(['Admin']), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, status, last_login')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    // Transform data to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.last_login
    }));

    res.json(transformedUsers);

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own data unless they're Admin
    if (req.user.role !== 'Admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, status, last_login')
      .eq('id', id)
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
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id
router.put('/:id', requireRole(['Admin']), [
  body('name').optional().trim().isLength({ min: 1 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['Admin', 'Editor', 'Viewer']),
  body('status').optional().isIn(['Active', 'Inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
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
    console.error('User update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting status to Inactive
    const { error } = await supabase
      .from('users')
      .update({ status: 'Inactive' })
      .eq('id', id);

    if (error) {
      console.error('User deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ message: 'User deactivated successfully' });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
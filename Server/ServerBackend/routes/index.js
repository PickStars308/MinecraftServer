const express = require('express');
const router = express.Router();
const commonRoutes = require('./commonRoutes');
const imageRoutes = require('./imageRoutes');
const historyRoutes = require('./historyRoutes');
const memberRoutes = require('./memberRoutes');
const adminAuthRoutes = require('./adminAuthRoutes');
const timelineImageRoutes = require('./timelineImageRoutes');
const installRoutes = require('./installRoutes');


router.use('/', commonRoutes);


router.use('/api/install', installRoutes);

router.use('/api', timelineImageRoutes);
router.use('/api', imageRoutes);


router.use('/api', memberRoutes);

router.use('/api', historyRoutes);
router.use('/api', adminAuthRoutes);

module.exports = router;

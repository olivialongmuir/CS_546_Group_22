// ROUTES FOR RODENT REPORTS

// TODO - update to res.render() when we have front end set up
// TODO - import and use validation

import { Router } from 'express';
const router = Router();

import {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
} from '../data/rodentReports.js';

// GET /rodentReports
// grabs all rodent reports
router.route('/').get(async (req, res) => {
  try {
    // can filter the reports
    const filters = req.query;

    const reports = await getAllReports(filters);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /rodentReports
// creates a rodent report
router.route('/').post(async (req, res) => {
  try {
    const data = req.body;

    if (!data.restaurantId || !data.userId || !data.description || data.latitude === undefined || data.longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const report = await createReport(data);

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /rodentReports/:id
// gets a rodent report by id
router.route('/:id').get(async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /rodentReports/:id
// updates a rodent report by id
router.route('/:id').patch(async (req, res) => {
  try {
    const updated = await updateReport(req.params.id, req.body);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /rodentReports/:id
// deletes a rodent report by id
router.route('/:id').delete(async (req, res) => {
  try {
    await deleteReport(req.params.id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
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
    const reports = await getAllReports();

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

    //Add in the default values needed for report creation
    let jobId = null

    let zipcode = data.zipcode
    let latitude = data.latitude
    let longitude = data.longitude
    //inspection date gets set to null since not related
    let inspectionDate = null;
    //status is unverififed as default
    let status = 'unverified';
    //approvedDate gets set to null since not related - This gets set when validated???
    let approvedDate = null;

    //If restaurant ID is blank then set it to null. That will be a report not associated to a report
    let restaurantId;
    if(data.restaurantId == ''){
      restaurantId = null;
    }else{
      restaurantId = data.restaurantId
    }
    
    //Get the user Id 
    let userId = '69e620a94370984bd615af92' //FAKE USER TODO
    let description = data.description

    const report = await createReport(
      jobId,
      zipcode,
      latitude,
      longitude,
      inspectionDate,
      status,
      approvedDate,
      restaurantId,
      userId,
      description
    );
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
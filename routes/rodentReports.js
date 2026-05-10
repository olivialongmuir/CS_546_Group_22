// ROUTES FOR RODENT REPORTS

import { Router } from 'express';
const router = Router();
import NodeGeocoder from 'node-geocoder';

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
// Only logged in users can create a new report - see middleware.js
router.route('/').post(async (req, res) => {
  try {
    const data = req.body;

    //Add in the default values needed for report creation
    let jobId = null

    //Populate the zip code if not given
    let zipcode;
    if(!data.zipcode){
      // Docs for node-geocoder https://www.npmjs.com/package/node-geocoder
      const geocoder = NodeGeocoder({provider: 'openstreetmap'});
      
      const geoResult = await geocoder.reverse({ lat: 40.7, lon: -73.9 });
      zipcode = geoResult[0]?.zipcode || null;
    }else{
      zipcode = date.zipcode
    }

    let latitude = data.latitude
    let longitude = data.longitude
    //inspection date gets set to null since not related
    let inspectionDate = null;
    //status is unverififed as default
    let status = 'unverified';
    //approvedDate gets set to null since not related - This gets set when validated?
    let approvedDate = null;

    //If restaurant ID is blank then set it to null. That will be a report not associated to a report
    let restaurantId;
    if(data.restaurantId == ''){
      restaurantId = null;
    }else{
      restaurantId = data.restaurantId
    }
    
    //Get the user Id from session
    let user = req.session.userId;
    let userId = user

    //Get description
    let description = data.description

    //Build the report
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

    //Posts the report status
    //Redirects user to that report
    res.redirect(`/ratreports/${report._id}`);

  } catch (error) {
    res.status(500).json({ error: error });
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
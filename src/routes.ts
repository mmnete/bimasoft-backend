import express from 'express';
import { addOrganization, removeOrganization } from './controller/organizationController';

const router = express.Router();

router.post('/add-organization', addOrganization);
// router.post('/update-organization', updateOrganization);
router.post('/remove-organization', removeOrganization);

export default router;
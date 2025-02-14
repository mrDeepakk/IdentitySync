import express from 'express';
import { identifyContact } from '../controllers/contactController';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

router.post('/identify', validateRequest, identifyContact);

export default router;

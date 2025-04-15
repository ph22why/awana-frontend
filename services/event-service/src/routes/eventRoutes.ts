import { Router } from 'express';
import { body, query } from 'express-validator';
import * as eventController from '../controllers/eventController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation middleware
const eventValidation = [
  body('eventName').notEmpty().trim().isString(),
  body('eventDate').isISO8601().toDate(),
  body('eventLocation').notEmpty().trim().isString(),
  body('eventPlace').notEmpty().trim().isString(),
  body('registrationStartDate').isISO8601().toDate(),
  body('registrationEndDate').isISO8601().toDate(),
  body('eventStartDate').isISO8601().toDate(),
  body('eventEndDate').isISO8601().toDate(),
  body('maxParticipants').isInt({ min: 1 }),
  body('registrationFee').isFloat({ min: 0 }),
  body('isPublic').optional().isBoolean(),
  validateRequest
];

const queryValidation = [
  query('year').optional().isInt({ min: 1900, max: 9999 }),
  query('isPublic').optional().isBoolean(),
  validateRequest
];

// Event routes
router.get('/', queryValidation, eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventValidation, eventController.createEvent);
router.put('/:id', eventValidation, eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// Sample event routes
router.get('/samples/list', eventController.getSampleEvents);
router.post('/samples/:sampleEventId/create', eventController.createEventFromSample);

export { router as eventRoutes }; 
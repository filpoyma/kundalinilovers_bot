import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { requireAdminApi } from '../middleware/requireAdminApi';
import {
  deleteSection,
  deleteSlot,
  getContent,
  getMe,
  getSchedule,
  getTimezone,
  postSection,
  postSlot,
  postTelegramAuth,
  putContent,
  putScheduleTitle,
  putSection,
  putSlot,
  putTimezone,
} from '../controllers/admin.controller';

const router: Router = Router();

router.post('/auth/telegram', asyncHandler(postTelegramAuth));

router.get('/me', requireAdminApi, asyncHandler(getMe));

router.get('/schedule/:type', requireAdminApi, asyncHandler(getSchedule));
router.put('/schedule/:type/title', requireAdminApi, asyncHandler(putScheduleTitle));

router.post('/schedule/:type/sections', requireAdminApi, asyncHandler(postSection));
router.put('/schedule/:type/sections/:id', requireAdminApi, asyncHandler(putSection));
router.delete('/schedule/:type/sections/:id', requireAdminApi, asyncHandler(deleteSection));

router.post('/schedule/:type/sections/:id/slots', requireAdminApi, asyncHandler(postSlot));
router.put('/schedule/:type/sections/:id/slots/:slotId', requireAdminApi, asyncHandler(putSlot));
router.delete('/schedule/:type/sections/:id/slots/:slotId', requireAdminApi, asyncHandler(deleteSlot));

router.get('/content/:key', requireAdminApi, asyncHandler(getContent));
router.put('/content/:key', requireAdminApi, asyncHandler(putContent));

router.get('/timezone', requireAdminApi, asyncHandler(getTimezone));
router.put('/timezone', requireAdminApi, asyncHandler(putTimezone));

export default router;

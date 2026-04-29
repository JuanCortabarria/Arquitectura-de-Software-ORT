import { Router } from 'express';
import { preferenceController } from '../controllers/preferenceController';
import { validate } from '../middlewares/validate';
import { updatePreferencesSchema } from '../schemas/preference.schema';

const router = Router();

router.put('/:userId', validate(updatePreferencesSchema), preferenceController.update);
router.get('/:userId', preferenceController.get);

export default router;

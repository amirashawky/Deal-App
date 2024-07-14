import express from 'express';
import advertismentController from '../../controllers/advertisments.controller/advertisments.controller';
import validator from '../../controllers/advertisments.controller/advertisments.validator';
import { requireAuth } from '../../services/passport';
import { checkOwnership } from '../../helpers/CheckMethods';
import config from '../../config';
const router = express.Router();



router.route('/').get( requireAuth, advertismentController.findAll);



router.route('/').post(requireAuth,
    checkOwnership([config.roles.ADMIN, config.roles.AGENT]),
    validator.validateCreate(), advertismentController.create
);


router.route('/:advertismentsId')
    .put(requireAuth,
        validator.validateUpdate(),
        advertismentController.update
    )
    .delete(requireAuth, advertismentController.delete)
    .get(advertismentController.findById)


export default router;
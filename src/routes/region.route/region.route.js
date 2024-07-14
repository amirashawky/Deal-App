let express = require('express');
let router = express.Router();
import regionController from "../../controllers/region.controller/region.controller";
import validator from "../../controllers/region.controller/region.validator";
import {requireAuth} from '../../services/passport';

router.route('/')
    .get(regionController.findAll)
    .post(requireAuth,validator.validateCreateBody(),regionController.create)


router.route('/:regionId')
    .get(requireAuth,regionController.findById)
    .put(requireAuth,validator.validateUpdateBody(),regionController.update)
    .delete(requireAuth,regionController.delete)

export default router;
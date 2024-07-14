let express = require('express');
let router = express.Router();
import cityController from "../../controllers/city.controller/city.controller";
import validator from "../../controllers/city.controller/city.validator";
import {requireAuth} from '../../services/passport';

router.route('/')
    .get(cityController.findAll)
    .post(requireAuth,validator.validateCreateBody(),cityController.create)


router.route('/:cityId')
    .get(requireAuth,cityController.findById)
    .put(requireAuth,validator.validateUpdateBody(),cityController.update)
    .delete(requireAuth,cityController.delete)

export default router;
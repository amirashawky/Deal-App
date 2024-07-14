let express = require('express');
let router = express.Router();
import countryController from "../../controllers/country.controller/country.controller";
import validator from "../../controllers/country.controller/country.validator";
import {requireAuth} from '../../services/passport';


router.route('/')
    .get(countryController.findAll)
    .post(requireAuth,
        
        validator.validateCreateBody(),countryController.create)


router.route('/:countryId')
    .get(requireAuth,countryController.findById)
    .put(
        requireAuth,
        
        validator.validateUpdateBody(),
        countryController.update
        )
    .delete(requireAuth,countryController.delete)

export default router;
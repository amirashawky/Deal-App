import express from 'express';
import requestController from '../../controllers/request.controller/request.controller';
import validator from '../../controllers/request.controller/request.validator';
import { requireAuth } from '../../services/passport';
import { checkOwnership } from '../../helpers/CheckMethods';
import config from '../../config';
const router = express.Router();



router.route('/match').get(requireAuth, requestController.match);
router.route('/').get( requireAuth,  requestController.findAll);


/**
 * @swagger
 * components:
 *   schemas:
 *     PropertyRequest:
 *       type: object
 *       required:
 *         - propertyType
 *         - area
 *         - price
 *         - city
 *         - district
 *         - description
 *       properties:
 *         propertyType:
 *           type: string
 *           example: "VILLA"
 *         area:
 *           type: integer
 *           example: 20
 *         price:
 *           type: integer
 *           example: 200000
 *         city:
 *           type: integer
 *           example: 1
 *         district:
 *           type: integer
 *           example: 2
 *         description:
 *           type: string
 *           example: "Description"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 *
 * /request:
 *   post:
 *     summary: Create a new property request
 *     description: Endpoint to create a new property request.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyRequest'
 *     responses:
 *       200:
 *         description: Successful operation
 *       403:
 *         description: rejection from the backend that define that the user has no permission to access this api.
 *       401:
 *         description: Unauthorized 
 *       422:
 *         description: Validation error,Invalid inputs to the request.
 */

router.route('/').post(requireAuth,
    checkOwnership([config.roles.ADMIN , config.roles.CLIENT]),
    validator.validateCreate(), requestController.create
);


router.route('/:requestId')
    .put(requireAuth,
        validator.validateUpdate(),
        requestController.update
    )
    .delete(requireAuth, requestController.delete)
    .get(requestController.findById)


export default router;
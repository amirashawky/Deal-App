import express from 'express';
import { requireAuth } from '../../services/passport';
import userController from '../../controllers/user.controller/user.controller';
import validator from '../../controllers/user.controller/user.validator';
import { checkOwnership } from '../../helpers/CheckMethods';
import config from '../../config';
const router = express.Router();



router.route('/signup')
    .post( validator.validateUserCreateBody(), userController.userSignUp);



router.post('/signin', validator.validateUserSignin(), userController.signIn);

router.get('/allUsers', requireAuth, userController.findAll);

router.get('/userInfo', userController.userInformation)




router.put('/user/updateInfo',
    requireAuth,

    validator.validateUserUpdate(),
    userController.updateInfo);


router.route('/account').delete(requireAuth, userController.deleteAccount);


/**
 * @swagger
 * /stats:
 *  get:
 *    summery: Admin statistics 
 *    description: This endpoint for admin users to return statistics about how many ads or requests exist for a user (client or agent) and the total amount of those ads or requests.
 *    tags:
 *      - Users
 *    produces:
 *      - application/json
 *    responses:
 *       200:
 *         description: data contains statistics about the users in pagination design 
 *       403:
 *         description: rejection from the backend that define that the user has no permission to access the data generated in this api.
 *       401:
 *         description: Unauthorized 
 */

router.route('/stats').get( requireAuth,checkOwnership([config.roles.ADMIN]),  userController.stats);


export default router;

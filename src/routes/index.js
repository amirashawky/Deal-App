import express from 'express';
const router = express.Router();
import countryRouter from './country.route/country.route';
import cityRouter from './city.route/city.route';
import regionRouter from './region.route/region.route';
import userRoute from './user.route/user.route';
import requestRouter from './request.route/request.route';
import advertismentsRoute from './advertisment.route/advertisment.route';


router.use('/',userRoute);
router.use('/country',countryRouter);
router.use('/city',cityRouter);
router.use('/region',regionRouter);
router.use('/advertisements',advertismentsRoute);
router.use('/request',requestRouter);




export default router;
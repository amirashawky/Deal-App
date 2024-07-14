import Region from "../../models/region.model/region.model";
import City from "../../models/city.model/city.model";

import ApiResponse from "../../helpers/ApiResponse";
import ApiError from "../../helpers/ApiError";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods";
import { body } from 'express-validator/check';
import { checkValidations } from "../shared.controller/shared.controller";
import i18n from 'i18n';
import dotObject from 'dot-object';
let populateQuery = [

    { path: 'city', model: 'city', populate: [{ path: 'country', model: 'country' }] }];



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [

                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, city: req.body.city };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, city: req.body.city };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('city').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, City, { deleted: false });
                    return true;
                })
            ];
        }
        else {
            validations = [


                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.regionId } };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {
                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.regionId } };
                        let region = await Region.findOne(query).lean();
                        if (region)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),

                body('city').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, City, { deleted: false });
                    return true;
                })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {

            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { city, country, removeLanguage, all } = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 }

            

            if (city) query.city = city;
            if (country) {
                let cities = await City.find({ deleted: false, country: country }).distinct('_id');
                query.city = { $in: cities }
            }


            let count = await Region.count(query);
            let pageCount = count;
            let regions;
            if (all) {
                pageCount = 1;
                limit = count;
                regions = await Region.find(query)
                    .sort({ createdAt: -1 }).populate(populateQuery).sort(sortQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);

                regions = await Region.find(query)
                    .sort({ createdAt: -1 }).limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery).sort(sortQuery);
            }

            if (!removeLanguage) {
                regions = Region.schema.methods.toJSONLocalizedOnly(regions, i18n.getLocale());
            }

            res.send(new ApiResponse(regions, page, pageCount, limit, count, req));



        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            
            let validatedBody = checkValidations(req);
            let region = await Region.create(validatedBody);
            region = await Region.populate(region, populateQuery);
            region = Region.schema.methods.toJSONLocalizedOnly(region, i18n.getLocale());
            res.status(200).send(region);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { regionId } = req.params;
            let { removeLanguage } = req.query;
            let user = req.user;
            
            await checkExist(regionId, Region, { deleted: false });
            let validatedBody = checkValidations(req);

            validatedBody = dotObject.dot(validatedBody);
            let updatedRegion = await Region.findByIdAndUpdate(regionId, validatedBody, { new: true });
            if (!removeLanguage)
                updatedRegion = Region.schema.methods.toJSONLocalizedOnly(updatedRegion, i18n.getLocale());
            res.status(200).send(updatedRegion);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { regionId } = req.params;
            let { removeLanguage } = req.query;
            let region = await checkExistThenGet(regionId, Region, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                region = Region.schema.methods.toJSONLocalizedOnly(region, i18n.getLocale());
            }
            res.status(200).send(region);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            
            let { regionId } = req.params;
            let region = await checkExistThenGet(regionId, Region, { deleted: false });
            region.deleted = true;
            await region.save();
            res.status(200).send("Deleted Successfully");

        }
        catch (err) {
            next(err);
        }
    }
}
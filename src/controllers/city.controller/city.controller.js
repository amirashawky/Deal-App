import City from "../../models/city.model/city.model";
import Country from "../../models/country.model/country.model";
import Region from "../../models/region.model/region.model";

import ApiResponse from "../../helpers/ApiResponse";
import ApiError from "../../helpers/ApiError";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods";
import { body } from 'express-validator/check';
import { checkValidations } from "../shared.controller/shared.controller";
import i18n from 'i18n';
import dotObject from 'dot-object';
let populateQuery = [
    
    { path: 'country', model: 'country' },
];



export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('name.ar').trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, country: req.body.country };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, country: req.body.country };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('country').not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                })
            ];
        }
        else {
            validations = [
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false,  _id: { $ne: req.params.cityId } };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false,  _id: { $ne: req.params.cityId } };
                        let city = await City.findOne(query).lean();
                        if (city)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                
                body('country').optional().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') }).custom(async (val, { req }) => {
                    await checkExist(val, Country, { deleted: false });
                    return true;
                })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  country,all,removeLanguage} = req.query;
            let query = { deleted: false };
            let sortQuery = { _id: -1 };

           
                
            if (country) query.country = country;

            let count = await City.count(query);
            let pageCount = count;
            let cities;
            if (all) {
                pageCount=1;
                limit = count;
                cities = await City.find(query).sort(sortQuery)
                    .populate(populateQuery);
            }
            else {
                pageCount = Math.ceil(count / limit);
                cities = await City.find(query).sort(sortQuery)
                .limit(limit).skip((page - 1) * limit)
                    .populate(populateQuery);
            }

            if (!removeLanguage) {
                cities = City.schema.methods.toJSONLocalizedOnly(cities, i18n.getLocale());
            }
            
            res.send(new ApiResponse(cities, page, pageCount, limit, count, req));

        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
           
            let validatedBody = checkValidations(req);
            let city = await City.create(validatedBody);
            city = await City.populate(city, populateQuery);
            city = City.schema.methods.toJSONLocalizedOnly(city, i18n.getLocale());
            res.status(200).send(city);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { cityId } = req.params;
            let { removeLanguage } = req.query;            
            let user = req.user;
            
            await checkExist(cityId, City, { deleted: false });
            let validatedBody = checkValidations(req);
            validatedBody = dotObject.dot(validatedBody);
            let updatedCity = await City.findByIdAndUpdate(cityId, validatedBody, { new: true });
            if(! removeLanguage) 
                updatedCity = City.schema.methods.toJSONLocalizedOnly(updatedCity, i18n.getLocale());
            res.status(200).send(updatedCity);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { cityId } = req.params;
            let { removeLanguage } = req.query;
            let city = await checkExistThenGet(cityId, City, { deleted: false, populate: populateQuery });
            if (!removeLanguage) {
                city = City.schema.methods.toJSONLocalizedOnly(city, i18n.getLocale());
            }
            res.status(200).send(city);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            
            let { cityId } = req.params;
            let city = await checkExistThenGet(cityId, City, { deleted: false });
            let region = await Region.findOne({deleted:false,city:cityId});
            if (region) {
                return next(new ApiError(400, i18n.__('relationExist')));
            }
            city.deleted = true;
            await city.save();
            res.status(200).send("Deleted Successfully");
            

        }
        catch (err) {
            next(err);
        }
    }
}
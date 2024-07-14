import Country from "../../models/country.model/country.model";
import City from "../../models/city.model/city.model";

import ApiResponse from "../../helpers/ApiResponse";
import ApiError from "../../helpers/ApiError";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods";
import { body } from 'express-validator/check';
import { checkValidations } from "../shared.controller/shared.controller";
import i18n from 'i18n';
import dotObject from 'dot-object'





export default {

    validateBody(isUpdate = false) {
        let validations
        if (!isUpdate) {
            validations = [
                body('name.ar').trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty()
                .withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    })
            ];
        }
        else {
            validations = [
                body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.countryId } };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    }),
                body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                    .custom(async (val, { req }) => {

                        let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.countryId } };
                        let country = await Country.findOne(query).lean();
                        if (country)
                            throw new Error(i18n.__('duplicated'));
                        return true;
                    })
            ];

        }
        return validations;
    },

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {  removeLanguage ,all} = req.query;
            let query = { deleted: false };
            let sortQuery = { createdAt: -1 }

            

            let countries;

            let count = await Country.count(query);
            let pageCount = count;
            if (all) {
                pageCount=1;
                limit = count;
                countries = await Country.find(query).sort(sortQuery)
            }
            else {
                pageCount = Math.ceil(count / limit);
                countries = await Country.find(query).sort(sortQuery).limit(limit).skip((page - 1) * limit)
            }
            
            if (!removeLanguage) {
                countries = Country.schema.methods.toJSONLocalizedOnly(countries, i18n.getLocale());
            }
            res.send(new ApiResponse(countries, page, pageCount, limit, count, req));


        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let user = req.user;
            
            let validatedBody = checkValidations(req);
            
            let country = await Country.create(validatedBody);
            country = Country.schema.methods.toJSONLocalizedOnly(country, i18n.getLocale());
            res.status(200).send(country);
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            let { countryId } = req.params;
            let user = req.user;
            let { removeLanguage } = req.query;
            
            await checkExist(countryId, Country, { deleted: false });
            let validatedBody = checkValidations(req);
           
            
            validatedBody = dotObject.dot(validatedBody);
            let updatedCountry = await Country.findByIdAndUpdate(countryId, {
                ...validatedBody
            }, { new: true });
            if (!removeLanguage)
                updatedCountry = Country.schema.methods.toJSONLocalizedOnly(updatedCountry, i18n.getLocale());
            res.status(200).send(updatedCountry);
        } catch (err) {
            next(err);
        }
    },

    async findById(req, res, next) {
        try {
            let { countryId } = req.params;
            let { removeLanguage } = req.query;
            let country = await checkExistThenGet(countryId, Country, { deleted: false });
            if (!removeLanguage) {
                country = Country.schema.methods.toJSONLocalizedOnly(country, i18n.getLocale());
            }
            res.status(200).send(country);

        } catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user;
            
            let { countryId } = req.params;
            let country = await checkExistThenGet(countryId, Country, { deleted: false });
            let city = await City.findOne({deleted: false , country:countryId});
            if (city) {
                return next(new ApiError(400, i18n.__('cityExist')));
            }
            country.deleted = true;
            await country.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
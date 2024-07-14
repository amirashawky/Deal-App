import City from "../../models/city.model/city.model";
import Country from "../../models/country.model/country.model";

import {  checkExist } from "../../helpers/CheckMethods";
import { body } from 'express-validator/check';

import i18n from 'i18n';




export default {

    validateCreateBody() {
        let validations

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

        return validations;
    },

    validateUpdateBody() {
        let validations

        validations = [
            body('name.ar').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { 'name.ar': val, deleted: false, _id: { $ne: req.params.cityId } };
                    let city = await City.findOne(query).lean();
                    if (city)
                        throw new Error(i18n.__('duplicated'));
                    return true;
                }),
            body('name.en').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('filedRequired') })
                .custom(async (val, { req }) => {

                    let query = { 'name.en': val, deleted: false, _id: { $ne: req.params.cityId } };
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


        return validations;
    }


}
import Country from "../../models/country.model/country.model";

import { body } from 'express-validator/check';

import i18n from 'i18n';






export default {

    validateCreateBody() {
        let validations

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

        return validations;
    },

    validateUpdateBody() {
        let validations

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


        return validations;
    },


}
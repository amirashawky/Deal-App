import Region from "../../models/region.model/region.model";
import City from "../../models/city.model/city.model";

import {  checkExist } from "../../helpers/CheckMethods";
import { body } from 'express-validator/check';

import i18n from 'i18n';




export default {

    validateCreateBody() {
        let validations

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

        return validations;
    },

    validateUpdateBody() {
        let validations

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


        return validations;
    },


}
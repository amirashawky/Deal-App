
import { body } from 'express-validator/check';
import User from '../../models/user.model/user.model';
import i18n from 'i18n';
import config from '../../config';


export default {



    validateUserSignin() {
        let validations = [
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('phoneRequired') }),
            body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
            body('type').not().isEmpty().withMessage(() => { return i18n.__('typeIsRequired') })
                .isIn(config.types).withMessage(() => { return i18n.__('userTypeWrong') }),
        ];
        return validations;
    },



    validateUserCreateBody() {
        let validations = [

            body('role').not().isEmpty().withMessage(() => { return i18n.__('roleRequired') })
            .isIn(config.types),
            body('name').not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
            body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                .isEmail().withMessage(() => { return i18n.__('EmailNotValid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { email: value, status: 'ACTIVE' };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('emailDuplicated'));
                    return true;
                }),
            body('password').not().isEmpty().withMessage(() => { return i18n.__('passwordRequired') }),
            body('phone').not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') }).custom(async (value, { req }) => {
                value = (value.trim()).toLowerCase();
                let userQuery = { phone: value, status: 'ACTIVE' };
                if (await User.findOne(userQuery))
                    throw new Error(i18n.__('phoneDuplicated'));
                return true;
            })
        ];
        return validations;
    },



    validateUserUpdate() {
        let validations = [
            body('name').optional().not().isEmpty().withMessage(() => { return i18n.__('nameRequired') }),
            body('email').optional().trim().not().isEmpty().withMessage(() => { return i18n.__('emailRequired') })
                .isEmail().withMessage(() => { return i18n.__('Email Not Valid') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { _id: { $ne: req.user.id }, email: value, status: 'ACTIVE'};
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('emailDuplicated'));
                    else
                        return true;
                }),
            body('phone').optional().not().isEmpty().withMessage(() => { return i18n.__('PhoneIsRequired') })
                .custom(async (value, { req }) => {
                    value = (value.trim()).toLowerCase();
                    let userQuery = { _id: { $ne: req.user.id }, phone: value, status: 'ACTIVE' };
                    if (await User.findOne(userQuery))
                        throw new Error(i18n.__('phoneDuplicated'));
                    else
                        return true;
                }),
        ];

        return validations;
    }

};
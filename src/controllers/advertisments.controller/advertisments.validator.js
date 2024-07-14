
import Advertisments from '../../models/advertisments.model/advertisments.model';
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet, checkExist } from "../../helpers/CheckMethods";
import { body } from 'express-validator/check';
import i18n from 'i18n';



export default {

    validateCreate() {
        let validations = [
            body('propertyType').not().isEmpty().withMessage(() => { return i18n.__('propertyTypeRequired') })
            .isIn(["VILLA" , "HOUSE", "LAND", "APARTMENT"]).withMessage(() => { return i18n.__('invalidType') }),
            body('area').not().isEmpty().withMessage(() => { return i18n.__('areaRequired') }),
            body('price').optional().not().isEmpty().withMessage(() => { return i18n.__('priceRequired') }),
            
            body('city').not().isEmpty().withMessage(() => { return i18n.__('cityRequired') }),
            body('district').not().isEmpty().withMessage(() => { return i18n.__('districtRequired') }),
            body('description').not().isEmpty().withMessage(() => { return i18n.__('descriptionRequired') }),

            body('user').optional().not().isEmpty().withMessage(() => { return i18n.__('userRequired') }),

        ];
        return validations;
    },

    validateUpdate() {
        let validations = [
            body('propertyType').optional().not().isEmpty().withMessage(() => { return i18n.__('propertyTypeRequired') })
            .isIn(["VILLA" , "HOUSE", "LAND", "APARTMENT"]).withMessage(() => { return i18n.__('invalidType') }),
            body('area').optional().not().isEmpty().withMessage(() => { return i18n.__('areaRequired') }),
            body('price').optional().optional().not().isEmpty().withMessage(() => { return i18n.__('priceRequired') }),
            
            body('city').optional().not().isEmpty().withMessage(() => { return i18n.__('cityRequired') }),
            body('district').optional().not().isEmpty().withMessage(() => { return i18n.__('districtRequired') }),
            body('description').optional().not().isEmpty().withMessage(() => { return i18n.__('descriptionRequired') }),

            body('user').optional().not().isEmpty().withMessage(() => { return i18n.__('userRequired') }),

            body('itemType').optional().not().isEmpty().withMessage(() => { return i18n.__('itemTypeRequired') })
            .isIn(["ADD" , "REQUEST"]).withMessage(() => { return i18n.__('invalidType') })
        ]
        return validations;
    }

}


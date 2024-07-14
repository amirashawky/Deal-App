import ApiError from './ApiError';
import moment from 'moment'
import i18n from 'i18n'







export function checkOwnership(types) {
    return (req, res, next) => {
        try {
            if (req.user) {
                if ( ! (types ||[]).includes(req.user.role) ) {
                    next(new ApiError(403, { message: `No permission` }));

                }
            }
            next();
        } catch (err) {
            next(new ApiError(400, { message: `Failed To Parse ` }));
        }
    }
}


export const checkExist = async (id, Model, extraQuery = {}, errorMessage = '') => {
    if (typeof extraQuery != 'object') {
        errorMessage = extraQuery;
        extraQuery = {};
    }
    if (validId(id)) {
        let model = await Model.findOne({ _id: id, ...extraQuery }).lean();
        if (model)
            return;
    }
    throw new ApiError(404, errorMessage || i18n.__('notFound') /*`${Model.modelName} Not Found`*/);
};



export function checkLanguage(arModel, enModel, req) {
    let language = i18n.getLocale(req);
    try {
        if (language == 'ar') {
            return arModel;
        }
        else {
            return enModel;
        }
    } catch (error) {
        throw new ApiError(400, 'Can Not Set Language.');
    }
}

export const checkExistThenGet = async (id, Model, findQuery = { populate: '', select: '' }, errorMessage = '') => {
    let populateQuery = findQuery.populate || '', selectQuery = findQuery.select || '';

    if (typeof findQuery != 'object') {
        errorMessage = findQuery;
        findQuery = {};
    } else {
        delete findQuery.populate;
        delete findQuery.select;
    }

    if (validId(id)) {
        let model = await Model.findOne({ _id: id, ...findQuery })
            .populate(populateQuery).select(selectQuery);
        if (model)
            return model;
    }

    throw new ApiError(404, errorMessage || i18n.__('notFound') /*`${Model.modelName} Not Found`*/);
};







export const validId = id => isNumeric(id);
export const validIds = ids => isArray(ids) && ids.every(id => validId(id));
export const isNumeric = value => Number.isInteger(parseInt(value));
export const isArray = values => Array.isArray(values);
export const isImgUrl = value => /\.(jpeg|jpg|png|PNG|JPG|JPEG)$/.test(value);
export const isLat = value => /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/.test(value);
export const isLng = value => /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/.test(value);
export const isYear = value => /^\d{4}$/.test(value);
export const isInternationNo = value => /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(value);
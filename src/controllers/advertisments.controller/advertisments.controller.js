
import Advertisments from '../../models/advertisments.model/advertisments.model';
import Request from '../../models/request.model/request.model';
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import { checkValidations } from "../shared.controller/shared.controller";

const populateQuery = [{ path: 'user', model: 'user' }];


export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let {
                propertyType,area,price,city,district,description,itemType,status,user
            } = req.query;
            let query = { status: 'ACTIVE' };
            let sortQuery = { createdAt: -1 };

            if (description) query.description = { '$regex': description, '$options': 'i' };
            if (user) query.user = + user;
            if (status) query.status = status;
            if (itemType) query.itemType = itemType;
            if (district) query.district = +district;
            if (city) query.city = +city;
            if (price) query.price = +price;
            if (area) query.area = +area;
            if (propertyType) query.propertyType = propertyType;

            let data =  await Advertisments.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind:{
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $facet: {
                        data: [
                            { $sort: sortQuery },
                            { $skip: ((page - 1) * limit) },
                            { $limit: limit }
                        ],
                        pageInfo: [   { $group: { _id: null, count: { $sum: 1 } } }]
                    }
                }
            ]);
            
            let count = data[0].pageInfo.length > 0 ? data[0].pageInfo[0].count : 0;
            let pageCount = Math.ceil(count / limit);
            data = data[0].data;
            res.send(new ApiResponse(data, page, pageCount, limit, count, req));
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            let validatedBody = checkValidations(req);
            if (!validatedBody.user) validatedBody.user = req.user.id;
            let advertisment = await Advertisments.create(validatedBody);
            res.status(200).send(advertisment);
        } catch (error) {
            next(error)
        }
    },

    async update(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            let { advertismentsId } = req.params;
            let advertisment = await checkExistThenGet(advertismentsId, Advertisments, { status: 'ACTIVE', populate: populateQuery });
            advertisment = await Advertisments.findByIdAndUpdate(advertismentsId, validatedBody, { new: true });
            res.status(200).send(advertisment);
        } catch (error) {
            next(error)
        }
    },

    async findById(req, res, next) {
        try {
            let { advertismentsId } = req.params;
            let advertisment = await checkExistThenGet(advertismentsId, Advertisments, { status: 'ACTIVE', populate: populateQuery });
            res.status(200).send(advertisment);
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user
            let { advertismentsId } = req.params;
            let advertisment = await checkExistThenGet(advertismentsId, Advertisments, { status: 'ACTIVE', populate: populateQuery });
            advertisment.status = 'DELETED';
            await advertisment.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    }
}


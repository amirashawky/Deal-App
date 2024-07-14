
import Requests from '../../models/request.model/request.model';
import ApiResponse from "../../helpers/ApiResponse";
import { checkExistThenGet } from "../../helpers/CheckMethods";
import { checkValidations } from "../shared.controller/shared.controller";

import schedule from 'node-schedule'
import advertismentsModel from '../../models/advertisments.model/advertisments.model';

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

            let data =  await Requests.aggregate([
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
            let request = await Requests.create(validatedBody);
            res.status(200).send(request);
        } catch (error) {
            next(error)
        }
    },

    async update(req, res, next) {
        try {
            let user = req.user;
            let validatedBody = checkValidations(req);
            let { requestId } = req.params;
            let request = await checkExistThenGet(requestId, Requests, { status: 'ACTIVE', populate: populateQuery });
            request = await Requests.findByIdAndUpdate(requestId, validatedBody, { new: true });
            res.status(200).send(request);
        } catch (error) {
            next(error)
        }
    },

    async findById(req, res, next) {
        try {
            let { requestId } = req.params;
            console.log('requestId ',requestId);
            let request = await checkExistThenGet(requestId, Requests, { status: 'ACTIVE', populate: populateQuery });
            res.status(200).send(request);
        }
        catch (err) {
            next(err);
        }
    },

    async delete(req, res, next) {
        try {
            let user = req.user
            let { requestId } = req.params;
            let request = await checkExistThenGet(requestId, Requests, { status: 'ACTIVE', populate: populateQuery });
            request.status = 'DELETED';
            await request.save();
            res.status(200).send("Deleted Successfully");
        }
        catch (err) {
            next(err);
        }
    },

    async requestJob() {

        let j = schedule.scheduleJob('* * */3 * *', async function (fireDate) {
            await Requests.updateMany({ status:'ACTIVE' }, { refreshedAt:new Date() });
        });
        
    },


    async match(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { add } = req.query;
           

            add = await checkExistThenGet(add,advertismentsModel,{status:'ACTIVE'});
            let tolerance  = (add.price / 100 ) * 10;
            let query = { 
                status: 'ACTIVE',
                price:{$gte : add.price - tolerance , $lte : add.price + tolerance   } ,
                area:add.area,
                district:add.district
            };
            let sortQuery = { refreshedAt: -1 };

            let data =  await Requests.aggregate([
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
    }
}


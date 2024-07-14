
import { checkValidations } from '../shared.controller/shared.controller';
import { generateToken } from '../../utils/token';
import User from '../../models/user.model/user.model';
import { checkExistThenGet } from '../../helpers/CheckMethods';
import ApiError from '../../helpers/ApiError';
import i18n from 'i18n';
import ApiResponse from '../../helpers/ApiResponse';


let populateQuery = [];


export default {

    async findAll(req, res, next) {
        try {
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { all, name, phone, email, status, role } = req.query;

            let query = { status: 'ACTIVE' };
            let sortQuery = { createdAt: -1 };

            if (status) query.status = status;
            if (name) query.name = { '$regex': name, '$options': 'i' };
            if (phone) query.phone = { '$regex': phone, '$options': 'i' };
            if (email) query.email = { '$regex': email, '$options': 'i' };
            if (role) query.role = role;

            let users;
            let pageCount;
            const userCount = await User.count(query);
            if (all) {
                users = await User.find(query).populate(populateQuery).sort(sortQuery);
                pageCount = 1;
            } else {
                users = await User.find(query).populate(populateQuery).sort({ _id: -1 }).limit(limit).skip((page - 1) * limit);
                pageCount = Math.ceil(userCount / limit);
            }

            users = User.schema.methods.toJSONLocalizedOnly(users, i18n.getLocale());
            res.send(new ApiResponse(users, page, pageCount, limit, userCount, req));
        } catch (error) {
            next(error)
        }
    },

    async signIn(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            let query = { status: 'ACTIVE', role: validatedBody.type };
            query.phone = validatedBody.phone.trim();
            let user = await User.findOne(query).populate(populateQuery);
            if (user) {

                await user.isValidPassword(validatedBody.password, async function (err, isMatch) {
                    if (err) {
                        next(err)
                    } else if (isMatch) {
                        return res.status(200).send({ user, token: generateToken(user.id) });
                    } else {
                        return next(new ApiError(400, i18n.__('passwordInvalid')));
                    }
                })
            } else {
                return next(new ApiError(403, i18n.__('userNotFound')));
            }
        } catch (err) {
            next(err);
        }
    },

    async userSignUp(req, res, next) {
        try {
            const validatedBody = checkValidations(req);
            if (validatedBody.email)
                validatedBody.email = (validatedBody.email.trim()).toLowerCase();

            let createdUser = await User.create(validatedBody);
            res.status(200).send({ user: createdUser, token: generateToken(createdUser.id) })
            
        } catch (err) {
            next(err);
        }
    },

    async updateInfo(req, res, next) {
        try {
            console.log(req.user);
            let userId = req.user.id;
            let validatedBody = checkValidations(req);
            let user = await checkExistThenGet(userId, User, { status: 'ACTIVE' });
            if (validatedBody.email) {
                validatedBody.email = (validatedBody.email.trim()).toLowerCase();
            }
            user = await User.findOneAndUpdate({ status: 'ACTIVE', _id: userId }, validatedBody, { new: true }).populate(populateQuery);
            res.status(200).send({user});
        } catch (error) {
            next(error);
        }
    },


    async userInformation(req, res, next) {
        try {
            let userId = req.query.userId;
            let user = await checkExistThenGet(userId, User, { status: 'ACTIVE', populate: populateQuery });
           
            res.status(200).send({ user: user });
        } catch (error) {
            next(error);
        }
    },

    async deleteAccount(req, res, next) {
        try {
            let user = await checkExistThenGet(req.user.id, User, { status: 'ACTIVE' });
            user.status = 'DELETED';
            await user.save();
           
            res.status(200).send('Deleted Successfully');
        } catch (error) {
            next(error);
        }
    },

    async stats(req, res, next){
        try {

            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { } = req.query;
            let query = { status: 'ACTIVE' };
            let sortQuery = { createdAt: -1 };


            let data =  await User.aggregate([
                { $match: query },
                
               
                
                {
                    $facet: {
                        data: [
                            { $sort: sortQuery },
                            { $skip: ((page - 1) * limit) },
                            { $limit: limit },
                            {
                                $lookup: {
                                    from: 'requests',
                                    localField: '_id',
                                    foreignField: 'user',
                                    as: 'requests'
                                }
                            },
                            {
                                $lookup: {
                                    from: 'advertisments',
                                    localField: '_id',
                                    foreignField: 'user',
                                    as: 'advertisments'
                                }
                            },
                            {
                                $addFields: {
                                    adsCount: { $size: "$advertisments" },
                                    totalAdsAmount: { $sum: "$advertisments.price" },
                                    requestsCount: { $size: "$requests" },
                                    totalRequestsAmount: { $sum: "$requests.price" }
                                }
                            }
                        ],
                        pageInfo: [   { $group: { _id: null, count: { $sum: 1 } } }]
                    }
                }
            ]);
            
            let count = data[0].pageInfo.length > 0 ? data[0].pageInfo[0].count : 0;
            let pageCount = Math.ceil(count / limit);
            data = data[0].data;
            res.send(new ApiResponse(data, page, pageCount, limit, count, req));
            
        } catch (error) {
            next(error)
        }
    }

};
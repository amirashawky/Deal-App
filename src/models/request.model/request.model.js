import mongoose,{ Schema} from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import autoIncrement from 'mongoose-auto-increment';
import  config  from '../../config';


const requestSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    propertyType:{
        type:String,
        enum:["VILLA" , "HOUSE", "LAND", "APARTMENT"]
    },
    area:{
        type:Number
    },
    price:{
        type:Number
    },
    city:{
        type:Number
    },
    district:{
        type:Number
    },
    description:{
        type:String
    },
    refreshedAt:{
        type:Date
    },
    status:{
        type: String,
        enum:['ACTIVE','DELETED'],
        default: 'ACTIVE'
    },
    user:{
        type: Number,
        ref:'user'
    }
}, { timestamps: true });

requestSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);

requestSchema.plugin(autoIncrement.plugin, { model: 'request', startAt: 1 });
requestSchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model('request', requestSchema);
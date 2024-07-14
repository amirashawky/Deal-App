import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';

const advertismentsSchema = new Schema({
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

advertismentsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);

advertismentsSchema.plugin(autoIncrement.plugin, { model: 'advertisments', startAt: 1 });
export default mongoose.model('advertisments', advertismentsSchema);
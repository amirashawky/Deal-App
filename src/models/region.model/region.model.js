import mongoose,{ Schema} from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import autoIncrement from 'mongoose-auto-increment';
import config from "../../config";
const RegionSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name:{
        type:String,
        i18n: true
    },
    
    city:{
        type: Number,
        required: true,
        ref:'city'
    },
    
    deleted:{
        type:Boolean,
        default:false
    }
       
}, { timestamps: true });

RegionSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);

RegionSchema.plugin(autoIncrement.plugin, { model: 'region', startAt: 1 });
RegionSchema.plugin(mongooseI18n, { locales:config.locals });

export default mongoose.model('region', RegionSchema);
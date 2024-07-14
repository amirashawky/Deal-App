import mongoose,{ Schema} from "mongoose";
import mongooseI18n from "mongoose-i18n-localize";
import autoIncrement from 'mongoose-auto-increment';
import  config  from '../../config';


const CountrySchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    
    name:{
        type:String,
        i18n: true
    },
    deleted:{
        type:Boolean,
        default:false
    }
       
}, { timestamps: true });

CountrySchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);

CountrySchema.plugin(autoIncrement.plugin, { model: 'country', startAt: 1 });
CountrySchema.plugin(mongooseI18n, { locales: config.locals });

export default mongoose.model('country', CountrySchema);
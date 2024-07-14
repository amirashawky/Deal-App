import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import bcrypt from 'bcryptjs';
import isEmail from 'validator/lib/isEmail';
import mongooseI18n from 'mongoose-i18n-localize'
import  config  from '../../config';

const userSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String
    },
    password: {
        type: String
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        validate: {
            validator: (email) => isEmail(email),
            message: 'Invalid Email Syntax'
        }
    },
    role: {
        type: String,
        enum: config.types,
        required: true,
        default:'CLIENT'
    },
    status:{
        type: String,
        enum:['ACTIVE','DELETED'],
        default: 'ACTIVE'
    }

}, { timestamps: true });


userSchema.pre('save', function (next) {
    const account = this;
    if (!account.isModified('password')) return next();
    const salt = bcrypt.genSaltSync();
    bcrypt.hash(account.password, salt).then(hash => {
        account.password = hash;
        next();
    }).catch(err => console.log(err));
});
userSchema.methods.isValidPassword = function (newPassword, callback) {
    let user = this;
    bcrypt.compare(newPassword, user.password, function (err, isMatch) {
        if (err)
            return callback(err);
        callback(null, isMatch);
    });
};

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
        delete ret.__v;
    }
});

autoIncrement.initialize(mongoose.connection);

userSchema.plugin(mongooseI18n, {locales: config.locals});
userSchema.plugin(autoIncrement.plugin, { model: 'user', startAt: 1 });
export default mongoose.model('user', userSchema);
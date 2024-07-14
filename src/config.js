const config = {};
config.mongoUrl = 'mongodb://127.0.0.1:27017/Deal-App';
config.jwtSecret = 'Deal-App';
config.confirmMessage = 'verify code: ';
config.App = { Name: 'Deal-App' }



config.SECRET_KEY = 'deal-email';
config.notificationTitle = {
    ar: "ديل ابليكيشن",
    en: 'Deal app'
}

config.locals = ['en', 'ar'];
config.types = ['ADMIN', 'CLIENT', 'AGENT'];
config.roles = {
    ADMIN: "ADMIN",
    CLIENT: "CLIENT",
    AGENT: "AGENT"
}

config.status = {
    active:1,
    inactive :2
}



export default config;
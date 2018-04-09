module.exports = {
  dev: {
    port: process.env.port || 4200,
    db: process.env.DB_LINK || "mongodb://localhost:27017/trim" /*your path to mongodb storage*/
  },
  prod: {}
};

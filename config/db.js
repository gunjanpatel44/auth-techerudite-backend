const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    port: Number(process.env.DB_PORT) || 3306,
    logging: false,
  }
);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync();
  } catch (error) {
    console.error("DB connection error:", error.message);
  }
})();

module.exports = sequelize;

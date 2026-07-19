import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host:    process.env.DB_HOST,
    port:    Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => console.log("[db] MySQL connected via Sequelize"))
  .catch(err => {
  console.error("[db] Connection failed:", err);
  process.exit(1);
});

const mysql = require("mysql");

const createConnection = () => {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  };

  if (process.env.INSTANCE_CONNECTION_NAME) {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
  }

  return mysql.createConnection(config);
};

module.exports = {
  load: (sql) => {
    return new Promise((resolve, reject) => {
      const connection = createConnection();
      connection.connect((err) => {
        if (err) {
          reject("Cannot connect database");
        } else {
          connection.query(sql, (error, results) => {
            if (error) reject(error);
            else {
              resolve(results);
            }
            connection.end();
          });
        }
      });
    });
  },
  add: (tablename, entity) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT IGNORE INTO ${tablename} SET ?`;
      const connection = createConnection();
      connection.connect((err) => {
        if (err) {
          reject("Cannot connect database");
        } else {
          connection.query(sql, entity, (error, value) => {
            if (error) reject(error);
            else {
              resolve(value.insertId);
            }
            connection.end();
          });
        }
      });
    });
  },
};

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
      connection.connect();
      connection.query(sql, (error, results) => {
        if (error) reject(error);
        else {
          resolve(results);
        }
        connection.end();
      });
    });
  },
  add: (tablename, entity) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT IGNORE INTO ${tablename} SET ?`;
      const connection = createConnection();
      connection.connect();
      connection.query(sql, entity, (error, value) => {
        if (error) reject(error);
        else {
          resolve(value.insertId);
        }
        connection.end();
      });
    });
  },
  update: (tablename, idField, entity) => {
    return new Promise((resolve, reject) => {
      const id = entity[idField];
      delete entity[idField];
      const sql = `UPDATE ${tablename} SET ? WHERE ${idField} = ?`;
      const connection = createConnection();
      connection.connect();
      connection.query(sql, [entity, id], (error, value) => {
        if (error) reject(error);
        else {
          resolve(value.changeRows);
        }
        connection.end();
      });
    });
  },
  delete: (tablename, idField, id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM ${tablename} WHERE ${idField} = ?`;
      const connection = createConnection();
      connection.connect();
      connection.query(sql, id, (error, value) => {
        if (error) reject(error);
        else {
          resolve(value.affectedRows);
        }
        connection.end();
      });
    });
  },
};

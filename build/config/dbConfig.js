"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    db: 'project2database',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 10000
    }
};
exports.default = dbConfig;

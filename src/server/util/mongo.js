'use strict';

let db;

exports.setDB = function (thedb) {
    db = thedb;
};

exports.collection = function (name) {
    return db.collection(name);
};

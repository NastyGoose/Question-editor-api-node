const debug = require("debug")("node:utils");

function removeUndefined(obj) {
    debug(obj);
    let newObj = {}

    for (let i = 0; i < Object.keys(obj).length; i++) {
        const key = Object.keys(obj)[i];
        if (obj[key]) newObj[key] = obj[key];
    }
    debug(newObj);

    return newObj;
}

module.exports = removeUndefined;
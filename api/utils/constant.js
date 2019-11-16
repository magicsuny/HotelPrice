const crypto = require('crypto');

module.exports = {
    MD5_SUFFIX: 'wsypylzshj',
    md5: (pwd) => {
        const md5 = crypto.createHash('md5');
        let s = md5.update(pwd).digest('hex');
        return s;
    },
    secretKey: `I'msittinghereinaboringroomIt'sjustanotherrainySundayafternoon`
};
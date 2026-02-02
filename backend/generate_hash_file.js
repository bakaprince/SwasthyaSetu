const bcrypt = require('bcryptjs');
const fs = require('fs');

bcrypt.hash('patient123', 10).then(hash => {
    fs.writeFileSync('hash.txt', hash);
    console.log('Hash written to hash.txt');
}).catch(err => {
    fs.writeFileSync('hash.txt', 'ERROR: ' + err.message);
});

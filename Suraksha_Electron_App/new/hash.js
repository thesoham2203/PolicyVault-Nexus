// hash_password.js
const bcrypt = require('bcrypt');

const password = 'MySecret123';

bcrypt.hash(password, 10).then(hash => {
    console.log('Password:', password);
    console.log('Bcrypt Hash:', hash);
}).catch(err => {
    console.error('Error:', err);
});

const bcrypt = require('bcryptjs');

const password = 'secureAdmin123';
const hash = '$2b$10$A9tNhIsAv1AuZobcAVYli./EdR61cJFoC1OnNfoBRIWqMWEyoD6Xa';

console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);

const isValid = bcrypt.compareSync(password, hash);
console.log(`Is Valid: ${isValid}`);

if (!isValid) {
    console.log("Generating new hash...");
    const newHash = bcrypt.hashSync(password, 10);
    console.log(`New Hash: ${newHash}`);
}

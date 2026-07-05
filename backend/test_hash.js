const bcrypt = require('bcryptjs');

const hash = '$2a$10$GoEIVO6PS6TTvhBWO4/9fe84V3UsJPyMXwaIbrZMz/nwHf.cRM2h.';
const password = 'admin123';

bcrypt.compare(password, hash).then(match => {
  console.log('Password Match:', match);
}).catch(err => {
  console.error('Bcrypt Error:', err);
});

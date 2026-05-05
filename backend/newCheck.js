const bcrypt = require('bcryptjs');
(async () => {
  const hash = await bcrypt.hash('shanaya', 10);
  console.log(hash);
})();

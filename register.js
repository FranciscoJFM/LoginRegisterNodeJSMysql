async function registerUser(pool, name, email, password, username) {
  const connection = await pool.getConnection();
  const [rows, fields] = await connection.execute(
    'INSERT INTO user_register (name, email, password, username) VALUES (?, ?, ?, ?)',
    [name, email, password, username]
  );
  connection.release();
}

function registerHandler(req, res) {
  const pool = req.app.locals.pool;
  const { name, email, password, username } = req.body;

  registerUser(pool, name, email, password, username)
    .then(() => {
      res.status(200).send('User registered successfully!');
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error registering user!');
    });
}

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'wpr',
  password: 'fit2024',
  port: 3306
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

const sid = "2201140079";
connection.query(`CREATE DATABASE IF NOT EXISTS wpr${sid}`, (err) => {
  if (err) throw err;
  console.log("Database created");

  connection.query(`USE wpr${sid}`, (err) => {
    if (err) throw err;

    const userTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `;
    connection.query(userTable, (err) => {
      if (err) throw err;
      console.log("Users table created");

      const users = [
        ['Dinh Tu', 'a@a.com', '123'],
        ['Hoang Ha', 'b@b.com', '456'],
        ['Lam Chi', 'c@c.com', '789']
      ];
      const userInsert = 'INSERT INTO users (fullname, email, password) VALUES ?';
      connection.query(userInsert, [users], (err) => {
        if (err) throw err;
        console.log("Sample users inserted");
      });
    });

    const emailTable = `
      CREATE TABLE IF NOT EXISTS emails (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        subject VARCHAR(255),
        body TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        attachment VARCHAR(255),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `;
    connection.query(emailTable, (err) => {
      if (err) throw err;
      console.log("Emails table created");

      const emails = [
        [1, 2, 'Hello', 'This is email from a@a.com to b@b.com', null],
        [2, 1, 'Reply', 'This is reply from b@b.com to a@a.com', null],
        [1, 3, 'Greetings', 'Email from a@a.com to c@c.com', null],
        [3, 1, 'Response', 'Reply from c@c.com to a@a.com', null]
      ];
      const emailInsert = 'INSERT INTO emails (sender_id, receiver_id, subject, body, attachment) VALUES ?';
      connection.query(emailInsert, [emails], (err) => {
        if (err) throw err;
        console.log("Sample emails inserted");
        connection.end();
      });
    });
  });
});

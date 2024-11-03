const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');

// Start server
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname)));

// Connect to database
const sid = "2201140079";
const db = mysql.createConnection({
  host: 'localhost',
  user: 'wpr',
  password: 'fit2024',
  database: `wpr${sid}`
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
});

// For file uploads
const upload = multer({ dest: 'uploads/' });
//
//
//
// ----------------HERE IS CODE FOR LOGIN PAGE     STATUS: 200-----------------------------------------------------------------------------
// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.cookies.user_id) {
    return res.redirect('/inbox');
  }
  next();
};

const isNotLoggedIn = (req, res, next) => {
  if (!req.cookies.user_id) {
    return res.redirect('/signin'); // Redirect to signin if not logged in
  }
  next();
};


app.get('/login', isLoggedIn, (req,res) =>{
  console.log("sign in");
  res.render('signin', {successMessage: null, errorMessage:null});
});
// app.get('/signup', (req, res) => {
// const successMessage = req.query.success || '';
//   res.render('signup', {successMessage, errorMessage: null });
// });

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  
  let errorMessage = {};
  if (!email) errorMessage.email = "Email is required";
  if (!password) errorMessage.password = "Password is required";
 
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, match) => {
        if (err) throw err;

        if (match) {
          res.cookie('user_id', user.id, { httpOnly: true });
          res.redirect('/inbox');
        } else {
          errorMessage.general = "Incorrect email or password.";
          res.render('signin', { successMessage:null, errorMessage });
        }
      });
    } 
  });
  
});
//
//
//
//
// -------------HERE IS CODE FOR REGISTER PAGE--------------------------------------------------------------------------------------
app.get('/signup', (req, res) => {
  res.render('signup', { errorMessage: null, successMessage : null });
});


app.post('/signup', (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  let errorMessage = {};

  if (!fullName) errorMessage.fullName = "Full Name is required";
  if (!email) errorMessage.email = "Email is required";
  if (!password) errorMessage.password = "Password is required";
  if (!confirmPassword) errorMessage.confirmPassword = "Please re-enter your password";
  if (password && password.length < 6) errorMessage.password = "Password must be at least 6 characters";
  if (password !== confirmPassword) errorMessage.confirmPassword = "Passwords do not match";

  if (Object.keys(errorMessage).length > 0) {
    return res.render('signup', { errorMessage, successMessage: null });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      errorMessage.email = "Email already used";
      return res.render('signup', { errorMessage, successMessage: null });
    } else {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;
        db.query('INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)', [fullName, email, hashedPassword], (err) => {
          if (err) throw err;
          res.redirect(`/signin?success=${encodeURIComponent("Registration successful! Please sign in.")}`);
        });
      });
    }
  });
});
//
//
//
//-----------------------HERE IS CODE FOR INBOX PAGE-------------------------------------------------------------------------------------------------

app.get('/inbox', isNotLoggedIn, (req, res) =>{
  const userId = req.cookies.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page -1 ) * limit;

//   db.query(
//     `
//     SELECT emails.*, users.fullName AS sender_name
//     FROM emails
//     JOIN users On emails.sender_id = users.id
//     WHERE receiver_id + ?
//     ORDER BY timestamp DESC
//     LIMIT ? OFFSET ? 
// `
//     [userId, limit, offset],
//     (err, results) =>{
//       if (err) throw err;

//       db.query('SELECT COUNT (*) AS total FROM emails WHERE receiver_id =?', [userId], (err, countResult) =>{
//         if(err) throw err;
//         const totalEmails = countResult[0].total;
//         const totalPages = Math.ceil(totalEmails / limit);
//         res.render('inbox', {emails: results, paage, totalPages});

//       });
//     }
    
//   );
});
//
//
//
//-----------------HERE IS CODE FOR DELETE FUNCTION---------------------------
app.delete('/email/:id', isNotLoggedIn, (req, res) => {
  const emailId = req.params.id;
  const userId = req.cookies.user_id;

  db.query('DELETE FROM emails WHERE id = ? AND (sender_id = ? OR receiver_id = ?)', [emailId, userId, userId], (err) => {
    if (err) throw err;
    res.send({ success: true });
  });
});
//
//
//
// ---------------HERE IS CODE FOR COMPOSE------------------------------------------------------------------------
app.get('/compose', isNotLoggedIn, (req,res) => {
   res.render('compose');
});
app.get('/compose', upload.single('attachment'), (req, res) =>{
  const  { receipient, subject,boy} = req.body;
  const senderId = req.cookies.user_id;
  const attachment = req.file ? req.file.filename: null;
  db.query('SELECR id FROM users WHERE email = ?', [recipient], (err, reuslts) =>{
    if (err) throw errl
    if(reuslts.length === 0 ){
      return res.send("Recipient not found.")
    }
    const receiverId = results[0].id;
    db.query (
      ' INSERT INTO emails (sender_id, receiver_id, subject, body, attachment) VALUES (? ,?, ?, ?, ?)'
      [senderId, receiverId, subject, body, attachment],
      (err) =>{
        if (err) throw err;
        res.redirect('/inbox');
      }
    )
  })
});
//
//
//
//----------HERE IS CODE FOE EMAIL DETAILS----------------------------------------------------------------------------
app.get('/email/:id', isNotLoggedIn, (req, res) => {
  const emailId = req.params.id;
  const userId = req.cookies.user_id;

  db.query('SELECT emails.*, users.fullname AS sender_name FROM emails JOIN users ON emails.sender_id = users.id WHERE emails.id = ? AND (receiver_id = ? OR sender_id = ?)', [emailId, userId, userId], (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      return res.status(404).send('Email not found or you do not have permission to view this email.');
    }
    res.render('detail', { email: results[0] });
  });
});
//
//
//
//------------HERE IS CODE FOR LOG OUT---------------------------------------------------------------------------
app.get('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/signin');
});
//
//
//
//-----------HERE IS CODE FOR OUTBOX----------------------------------------------------------------------------------
app.get('/outbox', isNotLoggedIn, (req, res) => {
  const userId = req.cookies.user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  db.query(
    `SELECT emails.*, users.fullname AS receiver_name 
     FROM emails 
     JOIN users ON emails.receiver_id = users.id 
     WHERE sender_id = ? 
     ORDER BY timestamp DESC 
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
    (err, results) => {
      if (err) throw err;

      // Get total count of sent emails for pagination
      db.query('SELECT COUNT(*) AS total FROM emails WHERE sender_id = ?', [userId], (err, countResult) => {
        if (err) throw err;
        const totalEmails = countResult[0].total;
        const totalPages = Math.ceil(totalEmails / limit);
        
        res.render('outbox', { emails: results, page, totalPages });
      });
    }
  );
});


app.listen(8000, () => {
  console.log("Server started on port 8000...");
});

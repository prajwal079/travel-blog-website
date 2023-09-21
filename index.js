const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors")
const nodemailer = require('nodemailer');

const app = express();

const db = 'mongodb+srv://adnanuso2001:adnan@everywhere.jb0urwl.mongodb.net/every'; 

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB successfully connected'))
  .catch(err => console.log(err));

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true }
});

const Email = mongoose.model('Email', EmailSchema);

app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 10000;

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
      user: 'c40af587f1e4ba', 
      pass: '46ed76f9f69984',
  }
});

app.post('/contact', (req, res) => {
  let message = {
    from: 'from@example.com',
    to: 'to@example.com',
    subject: 'Contact Form', 
    text: `From: ${req.body.name}\nEmail: ${req.body.email}\nMessage: ${req.body.message}`, 
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log('Error occurred. ' + err.message);
      return res.status(500).json({ error: 'Error occurred. ' + err.message });
    }

    console.log('Message sent: %s', info.messageId);
    res.json({ success: 'Message sent: ' + info.messageId });
  });
});

app.post('/submit', (req, res) => {
  Email.findOne({ email: req.body.email })
    .then(email => {
      if (email) {
        return res.status(400).json({ email: 'Email already exists' });
      } else {
        const newEmail = new Email({
          email: req.body.email
        });

        newEmail.save()
          .then(() => res.json(`Email added! ${req.body.email}`))
          .catch(err => res.status(400).json('Error: ' + err));
      }
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
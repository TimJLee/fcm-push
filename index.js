const express = require('express');
const webpush = require('web-push');
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
//test
app.use(express.static(path.join(__dirname, "client")));

app.use(bodyParser.json());

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setGCMAPIKey('AAAAPoQPy4A:APA91bH-mmSQO-ewPFGU8MIOQl5C0RxrXsIsXyowSYnXM0uOPBtft81f30GIIWz6DLgA7t2iIyHlRFBqL8xj47ZgSMBPaqowjmiPRJdBjSyatG9XQuetKLT6_Ayp9yk24aHBZMMBDcl1');
// Replace with your email
webpush.setVapidDetails(
  'mailto:test@test.com', 
  publicVapidKey, 
  privateVapidKey
);

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "Push test" });

  console.log(subscription);

  webpush.sendNotification(subscription, payload).catch(error => {
    console.error(error.stack);
  });
});

//app.use(require('express-static')('./'));

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));

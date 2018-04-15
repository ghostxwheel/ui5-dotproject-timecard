const path = require('path');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const fs = require('fs');

const loginCheck = require('./routes/loginCheck');
const companies = require('./routes/companies');
const projects = require('./routes/projects');
const tasks = require('./routes/tasks');
const timecard = require('./routes/timecard');
const timecardDelete = require('./routes/timecardDelete');
const report = require('./routes/report');
const stats = require('./routes/stats');
const commonTasks = require('./routes/commonTasks');
const telegram = require('./helpers/telegram');

const app = express();

const ui5Resources = path.join(__dirname, 'ui');
const year = 60 * 60 * 24 * 365 * 1000;
const port = process.env.PORT || '8081';

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//set default mime type to xml for ".library" files
express.static.mime.default_type = "text/xml";

// Serve up content directory showing hidden (leading dot) files
app.use('/', express.static(ui5Resources, {
  maxAge: year,
  hidden: true
}));

app.post('/api/loginCheck', loginCheck);
app.post('/api/companies', companies);
app.post('/api/companies/:company/projects', projects);
app.post('/api/companies/:company/projects/:project/tasks', tasks);
app.post('/api/timecard', timecard);
app.delete('/api/timecard', timecardDelete);
app.post('/api/report', report);
app.post('/api/stats', stats);
app.post('/api/commonTasks', commonTasks);

// enable directory listening
app.use('/', serveIndex(ui5Resources));

app.listen(port);

console.log(`Magic happens on port ${port}`);

module.exports = app;
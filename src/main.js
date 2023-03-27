const axios = require('axios');
const {parse} = require('csv-parse');
const {stringify} = require('csv-stringify');
const fs = require('fs');

let changedUsers = [];
const BATCH_SIZE = 100;
const MAX_REQUESTS_PER_SECOND = 5;
let tokenBucket = MAX_REQUESTS_PER_SECOND;
const yesterday_file = './assets/yesterday_users.csv';
const todays_file = './assets/today_users.csv';

async function sendBatchToAPI(batch) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const url = 'https://reqres.in/api/users';

  try {
    const response = await axios.post(url,{
      ...config,
      body:  batch,
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

async function sendRecordsToAPI(records) {
  const numBatches = Math.ceil(records.length / BATCH_SIZE);
  const batches = [];

  for (let i = 0; i < numBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, records.length);
    batches.push(records.slice(start, end));
  }

  for (let i = 0; i < batches.length; i++) {
    while (tokenBucket < 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      tokenBucket += MAX_REQUESTS_PER_SECOND;
    }
    await sendBatchToAPI(batches[i]);
    tokenBucket -= 1;
  }
}

async function main() {

  fs.readFile(yesterday_file, 'utf8', (err, yesterdayData) => {
    if (err) throw err;
  
    parse(yesterdayData, { columns: true }, (err, yesterdayUsers) => {
      if (err) throw err;
  
      fs.readFile(todays_file, 'utf8', (err, todayData) => {
        if (err) throw err;
  
        parse(todayData, { columns: true }, (err, todayUsers) => {
          if (err) throw err;
  
          for (let i = 0; i < todayUsers.length; i++) {
            const todayUser = todayUsers[i];
            const yesterdayUser = yesterdayUsers.find(
              (user) => user.storeId === todayUser.storeId
            );
            if (
              !yesterdayUser ||
              todayUser.city !== yesterdayUser.city ||
              todayUser.state !== yesterdayUser.state ||
              todayUser.province !== yesterdayUser.province ||
              todayUser.pincode !== yesterdayUser.pincode
            ) {
              changedUsers.push(todayUser);
            }
          }
  
          stringify(changedUsers, { header: true }, (err, output) => {
            if (err) throw err;
            fs.writeFile('./assets/changed_values.csv', output, (err) => {
              if (err) throw err;
              console.log('The file has been saved!');
            });
          });

					sendRecordsToAPI(changedUsers);

        });
      });
    });
  });
}

main();
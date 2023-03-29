const axios = require('axios');
const {parse} = require('csv-parse');
const {stringify} = require('csv-stringify');
const fs = require('fs');

let changedUsers = [];
const BATCH_SIZE = 200;
const MAX_REQUESTS_PER_SECOND = 5000;
let tokenBucket = MAX_REQUESTS_PER_SECOND;
const yesterday_file = './assets/maturity_store_segment_2023_03_23.csv';
const todays_file = './assets/maturity_store_segment_[Leanplum_Attributes]_2023_03_26.csv';

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
	console.log(`Program ended at ${new Date().toLocaleString()}`);
}

async function main() {

	console.log(`Program started at ${new Date().toLocaleString()}`);
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
              (user) => user.user_id === todayUser.user_id
            );
            if (
              !yesterdayUser ||
              todayUser.toString() != yesterdayUser.toString()
            ) {
              changedUsers.push(todayUser);
            }
          }
					
          stringify(changedUsers, { header: true }, (err, output) => {
            if (err) throw err;
            fs.writeFile('./assets/changed_values_prod.csv', output, (err) => {
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
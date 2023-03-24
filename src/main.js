const axios = require('axios');

let data = [];
async function generateDummyData(numRecords) {
  
    // Define arrays of possible values for each attribute
    const storeIds = [...Array(numRecords).keys()].map(i => `Store ${i+1}`);
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const states = ['New York', 'California', 'Illinois', 'Texas', 'Arizona','Tempe', 'Mussori'];
    const provinces = ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba'];
    const pincodes = [...Array(numRecords).keys()].map(i => `10100${i+1}`.slice(-5));
  
    // Generate random records with the specified attributes
    for (let i = 0; i < numRecords; i++) {
      const record = {
        storeId: storeIds[i],
        city: cities[Math.floor(Math.random() * cities.length)],
        state: states[Math.floor(Math.random() * states.length)],
        province: provinces[Math.floor(Math.random() * provinces.length)],
        pincode: pincodes[i],
      };
      data.push(record);
    }
  
    return data;
  }
  
async function getData() {
    data = await generateDummyData(5000)
}
getData();
console.log(data);


// ----------------------------------------------------------------------------- //


// Define the number of records per batch
const BATCH_SIZE = 100;

// Define the maximum number of requests per second
const MAX_REQUESTS_PER_SECOND = 5;

// Define the token bucket
let tokenBucket = MAX_REQUESTS_PER_SECOND;

// Define the function to send a batch of records to the API
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

// Define the function to send records from an array to the API with rate limiting
async function sendRecordsToAPI(records) {
  // Divide the array of records into batches
  const numBatches = Math.ceil(records.length / BATCH_SIZE); //100 batches ---> 10000/100
  const batches = [];

  for (let i = 0; i < numBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, records.length);
    batches.push(records.slice(start, end)); //pushing 100 records as a batch into batches array
  }

  //batches array is an array of arrays where each array is considered as a batch of 100 items.

  // Send each batch of records to the API with rate limiting
  for (let i = 0; i < batches.length; i++) {
    // Wait until there are enough tokens in the token bucket
    while (tokenBucket < 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      tokenBucket += MAX_REQUESTS_PER_SECOND;
    }

    // Send the batch to the API
    await sendBatchToAPI(batches[i]);

    // Decrement the token count in the token bucket
    tokenBucket -= 1;
  }
}

// Call the function with the array of records
sendRecordsToAPI(data);
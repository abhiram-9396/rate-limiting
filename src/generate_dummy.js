const {stringify} = require('csv-stringify');
const fs = require('fs');

function generateDummyData(numRecords) {
    const data = [];
  
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
  
const data = generateDummyData(10000);
// console.log(data);

stringify(data, { header: true }, (err, output) => {
  if (err) throw err;
  fs.writeFile('./assets/today_users.csv', output, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
});
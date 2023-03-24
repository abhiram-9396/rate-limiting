const {parse} = require('csv-parse');
const {stringify} = require('csv-stringify');
const fs = require('fs');

// Read yesterday's users CSV file
fs.readFile('./assets/yesterday_users.csv', 'utf8', (err, yesterdayData) => {
  if (err) throw err;

  // Parse yesterday's users CSV data
  parse(yesterdayData, { columns: true }, (err, yesterdayUsers) => {
    if (err) throw err;

    // Read today's users CSV file
    fs.readFile('./assets/today_users.csv', 'utf8', (err, todayData) => {
      if (err) throw err;

      // Parse today's users CSV data
      parse(todayData, { columns: true }, (err, todayUsers) => {
        if (err) throw err;

        // Find the changed users
        const changedUsers = [];
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

        // Write the changed users to a new CSV file
        stringify(changedUsers, { header: true }, (err, output) => {
          if (err) throw err;
          fs.writeFile('./assets/changed_values.csv', output, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          });
        });
      });
    });
  });
});

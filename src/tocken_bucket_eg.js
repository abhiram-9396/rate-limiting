let data = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
let batches = [];
const BATCH_SIZE = 3;

const MAX_REQUESTS_PER_SECOND = 2;

let tokenBucket = MAX_REQUESTS_PER_SECOND;

const numBatches = Math.ceil(data.length / BATCH_SIZE);

for (let i = 0; i < numBatches; i++) {
    const start = i * BATCH_SIZE;
    const end = Math.min((i + 1) * BATCH_SIZE, data.length);
    batches.push(data.slice(start, end)); //pushing records as a batch into batches array
}

async function main(){

    for (let i = 0; i < batches.length; i++) {
        // Wait until there are enough tokens in the token bucket
        while (tokenBucket < 1) {
          await new Promise(resolve => {
            setTimeout(resolve, 1000)
            });
          tokenBucket += MAX_REQUESTS_PER_SECOND;
        }

        // await new Promise(resolve => {
        //     console.log(batches[i]);
        //     setTimeout(resolve, 1000)
        //     });
        console.log(batches[i]);
        tokenBucket -= 1;
    }
}

main();
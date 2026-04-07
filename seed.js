import { dbConnection, closeConnection } from './config/mongoConnection.js';
import { restaurants, rodentReports, users } from './config/mongoCollections.js';

/*
Seed file for SquakPeek

Collections:
  users
  restaurants
  rodentReports

*/

const main = async () => {
  const db = await dbConnection();
  await db.dropDatabase();

  const restaurantCollection = await restaurants();
  const rodentReportCollection = await rodentReports();
  const userCollection = await users();

  const restaurantData = require('./database/restaurants.json');
  const rodentReportData = require('./database/rodents.json');

  //creating one example of each user type
  const userData = [
    {
      "type": "consumer",
      "firstName": "John",
      "lastName": "Smith",
      "username": "smithy889",
      "emailAddress": "johnSmith643@gmail.com",
      "hashPassword": null,
      "timestamp": "2026-03-04T01:26:32.547Z",
      "comments": []
    },
    {
      "type": "exterminator",
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "ratProof_knight",
      "emailAddress": "themightyRat153@outlook.com",
      "hashPassword": null,
      "timestamp": "2026-02-01T02:17:32.547Z",
      "comments": []
    },
    {
      "type": "inspector",
      "firstName": "Alex",
      "lastName": "Willworth",
      "username": "willworth.Alex",
      "emailAddress": "willworth_alex_156@gov.com",
      "hashPassword": null,
      "timestamp": "2026-01-05T04:23:32.547Z",
      "comments": []
    },
    {
      "type": "restaurant",
      "firstName": "Mary",
      "lastName": "Ann",
      "username": "222bestRestaurant666",
      "emailAddress": "barAndGrillAnn@gmail.com",
      "hashPassword": null,
      "timestamp": "2026-04-03T07:56:32.547Z",
      "comments": []
    },
    {
      "type": "admin",
      "firstName": "John",
      "lastName": "Smith",
      "username": "smithy889",
      "emailAddress": "johnSmith643@gmail.com",
      "hashPassword": null,
      "timestamp": "2026-04-07T08:56:32.547Z",
      "comments": []
    }
  ]

  await restaurantCollection.insertMany(restaurantData);
  await rodentReportCollection.insertMany(rodentReportData);
  await userCollection.insertMany(userData);

  await closeConnection();
}

main();
import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { restaurants, rodentReports, users } from '../config/mongoCollections.js';
import restaurantData from '../database/restaurants.json' with { type: 'json' }
import rodentReportData from '../database/rodents.json' with { type: 'json' }
import { hash } from 'bcryptjs';

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

  const adminPassword = 'Admin123!';
  const seededPassword = 'Password1!';
  const adminHash = await hash(adminPassword, 10);
  const seededHash = await hash(seededPassword, 10);

  //creating one example of each user type
  const userData = [
    {
      "type": "admin",
      "firstName": "Site",
      "lastName": "Admin",
      "username": "admin",
      "emailAddress": "admin@squeakpeek.local",
      "hashPassword": adminHash,
      "approved": true,
      "timestamp": "2026-01-01T00:00:00.000Z",
      "comments": []
    },
    {
      "type": "consumer",
      "firstName": "John",
      "lastName": "Smith",
      "username": "smithy889",
      "emailAddress": "johnSmith643@gmail.com",
      "hashPassword": seededHash,
      "approved": true,
      "timestamp": "2026-03-04T01:26:32.547Z",
      "comments": []
    },
    {
      "type": "exterminator",
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "ratProof_knight",
      "emailAddress": "themightyRat153@outlook.com",
      "hashPassword": seededHash,
      "approved": true,
      "timestamp": "2026-02-01T02:17:32.547Z",
      "comments": []
    },
    {
      "type": "inspector",
      "firstName": "Alex",
      "lastName": "Willworth",
      "username": "willworthAlex",
      "emailAddress": "willworth_alex_156@gov.com",
      "hashPassword": seededHash,
      "approved": true,
      "timestamp": "2026-01-05T04:23:32.547Z",
      "comments": []
    },
    {
      "type": "restaurant",
      "firstName": "Mary",
      "lastName": "Ann",
      "username": "bestRestaurant666",
      "emailAddress": "barAndGrillAnn@gmail.com",
      "hashPassword": seededHash,
      "approved": true,
      "timestamp": "2026-04-03T07:56:32.547Z",
      "comments": []
    }
  ]

  await restaurantCollection.insertMany(restaurantData);


  //Appends a blank comment array to all rodentReprot objes
  for(const obj of rodentReportData){
    obj.comments = [];
  }

  await rodentReportCollection.insertMany(rodentReportData);
  await userCollection.insertMany(userData);

  console.log(`Seed complete.`);
  console.log(`  admin login - username: admin // password: ${adminPassword}`);
  console.log(`  user logins - password for all seeded non-admin users: ${seededPassword}`);

  await closeConnection();
}

main();

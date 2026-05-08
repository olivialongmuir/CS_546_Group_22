# CS_546_Group_22

## SqueakPeek

SqueakPeek is designed to improve dining safety in New York City by mapping restaurants in areas with documented rodent activity. It combines official reports with real-time, user-submitted sightings to create an interactive heat map that highlights potential sanitation risks. Users can contribute by reporting rodent encounters and sharing updates on nearby restaurant conditions, allowing the data to stay continuously updated. The goal is to help diners make more informed, data-driven decisions about where to eat while discouraging visiting potentially unsanitary establishments. In addition to supporting consumers, the platform also provides useful real-time information for health inspectors and pest control professionals, ultimately promoting greater transparency and encouraging higher standards of cleanliness for food establishments.

## Requirements
-Node.js
-MongoDB installed
-npm (node package manager)
-A running MongoDB instance

## How To Run SqueakPeek:
1. Clone the repository
```bash
git clone <https://github.com/olivialongmuir/CS_546_Group_22.git>
cd <CS_546_Group_22>
```
2. Install the dependencies
```bash
npm install
```
3. Seed the database
```bash
npm run seed
```
4. Run SqueakPeek
```bash
npm run start
```

## Home Page:


## Rat Map:

## Rodent Reports:

## Restaurants:

## Login/Signup:



## Directory Structure

```
.
├── app.js
├── helpers.js
├── middleware.js
├── seed.js
├── README.md
├── config/
│   ├── mongoCollections.js
│   ├── mongoConnection.js
│   └── settings.js
├── data/
│   ├── restaurants.js
│   ├── rodentReports.js
│   └── users.js
├── database/
│   ├── restaurants.json
│   ├── restaurants_sample.json
│   ├── rodents.json
│   └── rodents_sample.json
├── public/
│   ├── css/
│   │   ├── profile.css
│   │   ├── restaurants.css
│   │   └── styles.css
│   ├── js/
│   │   ├── heatmap.js
│   │   ├── profile.js
│   │   └── rodentReports.js
│   └── images/
├── routes/
│   ├── auth.js
│   ├── index.js
│   ├── pageRoutes.js
│   ├── restaurants.js
│   ├── rodentReports.js
│   └── users.js
└── views/
    ├── layouts/
    │   └── main.handlebars
    ├── error.handlebars
    ├── heatmap.handlebars
    ├── home.handlebars
    ├── login.handlebars
    ├── profile.handlebars
    ├── ratreports.handlebars
    ├── register.handlebars
    ├── restaurant.handlebars
    └── restaurants.handlebars
```

# SqueakPeek - CS_546_Group_22

## Overview
SqueakPeek is designed to improve dining safety in New York City by mapping restaurants in areas with documented rodent activity. It combines official reports with real-time, user-submitted sightings to create an interactive heat map that highlights potential sanitation risks. Users can contribute by reporting rodent encounters and sharing updates on nearby restaurant conditions, allowing the data to stay continuously updated. The goal is to help diners make more informed, data-driven decisions about where to eat while discouraging visiting potentially unsanitary establishments. In addition to supporting consumers, the platform also provides useful real-time information for health inspectors and pest control professionals, ultimately promoting greater transparency and encouraging higher standards of cleanliness for food establishments.

## Requirements
* Node.js
* MongoDB installed
* npm (Node Package Manager)
* A running MongoDB instance

## Libraries and Frameworks
SqueakPeek is built in Node.js with Express.js as the backend and Handlebars as the server-side rendering engine.
Several libraries were used to build out the unique features of SqueakPeek
   -Leaflet used to render interactive maps and minimaps for displaying rodent report and restaurant locations throughout the city.
   -node-geocoder handles geocoding functionality, including converting geographic coordinates to map zipcodes for location management.
   -Lucide Icons orovides a modern and lightweight icon library used throughout the user interface to improve visual clarity and user experience.

## How To Run SqueakPeek:
1. Clone the repository
```bash
git clone https://github.com/olivialongmuir/CS_546_Group_22.git
cd CS_546_Group_22
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

The Rat Map is a core feature that visualizes restaurant data from the database alongside user-submitted rodent reports in the form of a heat map. Users can customize the map’s appearance based on their preferences, including toggling between light and dark modes and selecting different heat map color schemes to improve accessibility.

Registered users can contribute by creating rodent reports through a right-click action on the map and selecting “Create Rodent Report.” Additionally, administrators and restaurant owners can access a “Register Restaurant” option from the same context menu to add new establishments to the system.

On the right side of the map, a hotspot feed provides real-time insights into reporting activity, highlighting areas with higher concentrations of rodent reports across New York City’s boroughs and neighborhoods.

From the Rat Map, users can click on existing restaurant and report pins to display a popup containing a preview of the related details. From the popup, users can quickly navigate directly to the associated Rodent Report or Restaurant page for that item.

## Rodent Reports:

Rodent Reports contain detailed information about user-submitted rodent sightings across the city. Users can quickly locate reports of interest using the filter options available in the left-side panel. These filters are handled entirely on the client side, providing a fast and smooth user experience.

Users can select a report to view additional details, leave comments, and engage with other community reports. Each report also includes a graphical minimap displaying the exact location of the sighting.

## Restaurants:

## Login/Signup:

## Security/Auth:

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

# Team U30
## Bird Watching Web App


This is a  “Bird Watching” progressive web application that provides users (typically bird
watchers) with means to record and view Bird sightings and also to help with identification.

## Tech
| Tech | Stack |
| ------ | ------ |
| Frontend | ejs, Bootstrap |
| Backend | MongoDB, IndexedDB |
| Server | Node.js, Express.js, Socket.IO|


## Installation

```sh
"npm install" to install the dependencies
"node ./bin/www" to start the server // Listens on Port 3000
```

## Features
- Progressive and Responsive
- Supports online and offline interaction
- Real-time communication between users (Chat)
- Link to knowledge graph from DBPedia
- Create/View Sightings
- Data Persistence
- Interactive Maps (Reliable Internet Connection Required!)
## Instructions
- User needs to enter their nickname before starting to use the app on `/` 
- User can visit `/index` to view the created sightings and can sort the sightings according to identification, date and location (Sorting by the location needs few seconds to work depending on the internet connection)
- User can click `Add a Sighting` button on `/index` to visit `/create` where they can create a sighting
- User can click on the arrow for the sightings on `/index` to visit sighting details page
- User can view the sighting details (description, location, identification) and can also access to chat by clicking the `Chat` button
- User can view the previous comments and can make comments about the sighting
- User can view the detailed information of the bird from DBPedia based on the identification
- User can edit the sighting if they are the creator of the sighting by clicking the `Edit Sighting` button

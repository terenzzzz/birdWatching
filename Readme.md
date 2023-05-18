# Team U30

## Bird Watching Web App

This is a “Bird Watching” progressive web application that provides users (typically bird
watchers) with means to record and view Bird sightings and also to help with identification.

## Tech

| Category     | Technology               | Version |
| ------------ | ------------------------ | ------- |
| Frontend     | EJS                      | 3.1.9   |
|              | Bootstrap                | 5.3.0   |
| Backend      | MongoDB                  | 6.0.4   |
|              | IndexedDB                |         |
| Server       | Node.js                  | v19.8.1 |
|              | Express.js               | 4.18.2  |
|              | Socket.IO                | 4.4.1   |
|              | Socket.IO                | 4.4.1   |
| Http Request | fetch                    |         |
|              | fetch-sparql-endpoint    | 3.2.1   |
| Caching      | Network first then Cache |         |

## Installation

```sh
"npm install" to install the dependencies
"node ./bin/www" to start the server // Listens on Port 3000
```

## Features

- Progressive and Responsive
- Supports online and offline interaction and synchronisation
- Real-time communication between users (Chat)
- Link to knowledge graph from DBPedia
- Create/View Sightings
- Data Persistence
- Interactive Maps (Reliable Internet Connection Required!)

## Instructions

- User needs to enter their nickname before starting to use the app on `/`
<div>
    <img src=".\ReadmeSource\onBoarding_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\onBoarding.png" width="auto" height="400px">
</div>

- User can visit `/index` to view the created sightings and can sort the sightings according to identification, date and location (Sorting by the location needs few seconds to work depending on the internet connection)

<div>
    <img src=".\ReadmeSource\index_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\index.png" width="auto" height="400px">
</div>


- User can click `Add a Sighting` button on `/index` to visit `/create` where they can create a sighting
<div>
    <img src=".\ReadmeSource\create_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\create.png" width="auto" height="400px">
</div>


- User can click on the arrow for the sightings on `/index` to visit sighting details page
- User can view the sighting details (description, location, identification)
<div>
    <img src=".\ReadmeSource\description_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\description.png" width="auto" height="400px">
</div>



- User can access to chat by clicking the `Chat` button and view the previous comments and can make comments about the sighting
<div>
    <img src=".\ReadmeSource\chat_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\chat.png" width="auto" height="400px">
</div>


- User can view the detailed information of the bird from DBPedia based on the identification
<div>
    <img src=".\ReadmeSource\Identification_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\Identification.png" width="auto" height="400px">
</div>


- User can edit the sighting if they are the creator of the sighting by clicking the `Edit Sighting` button
<div>
    <img src=".\ReadmeSource\edit_phone.png" width="auto" height="400px">
    <img src=".\ReadmeSource\edit.png" width="auto" height="400px">
</div>


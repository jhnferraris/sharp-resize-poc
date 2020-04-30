[sharp](https://sharp.pixelplumbing.com/) Experiment

This is just a simple Node.js API endpoint using express to try out the image resizing feature of sharp and uploading it to an S3 compatible bucket

# Installation

1. Clone repository
2. Install dependencies: `$ npm install`
3. Create your `.env` by replacing the values found in `.env.replace`

# Start your server

1. `$ npm start`
2. Use your handy API client app (i.e. Postman)
3. Execute a file upload on the endpoint `http://localhost:8080/upload` with the key `media`

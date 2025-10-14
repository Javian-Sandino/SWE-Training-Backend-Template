# SHPE UF SWE Team Training Backend Template

## Congrats on being selected as prospective software developer directors! (aka Sweenies)
In this repository, you will find a template to help you build the backend of your training project. 

## Getting Started
Before starting out, it is important to handle these next steps:

- If you haven't already, make sure you install the latest version of node.js, link: https://nodejs.org/en

- Create our database! For this project, we will be using MongoDB to store information from and to our server. It is what we use to store all of SHPE UF's info from our website! 


- If you have not done so already, open a terminal command and run "npm install" in the folder where the package.json and package-lock.json are located. This will install all the dependencies you may need 
*(note: if you decide to implement something extra, you will have to npm install said dependencies)* But for now this should be enough to get the backend running!

Environment variables (.env)
-----------------------------
This project reads `MONGODB_URI` from the environment. You can either export it in your shell or create a local `.env` file in the `backend/` folder and the app will load it using `dotenv`.

Example `.env` (DO NOT COMMIT this file):

MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.b29aetw.mongodb.net/mydb?retryWrites=true&w=majority"

To install `dotenv` and run the server:

```bash
cd backend
npm install
npm install dotenv --save
# Start the server (ensure MONGODB_URI is set in .env or in your shell):
npm start
```

Once running, open the GraphQL playground at http://localhost:4000/graphql and run a quick test query:

{
	hello
}

Expected response:

{
	"data": {
		"hello": "Hello from the backend!"
	}
}

---
## About the Files
## index.js
The entry point of your backend application. It brings together all the key components of your GraphQL server, connects to your MongoDB database, and starts the server.

### Purpose
- Starts the Server: It gets your server up and running so it can start listening for requests from the frontend.

- Connects to the Database: It uses your config.js file to create a connection to your MongoDB database.

- Connects Everything: It brings together your definitions (TypeDefs.js) and your logic (resolvers), and makes them available to the server.

## config.js
This file is used to connect to the mongodb.

## Models Folder
the blueprints for all the data you will store in your database

### TypeName.js
tells MongoDB exactly what each piece of data should look like, what information it should contain and what type of data those fields should be (like a String, or a Number).

### User.js
Defines user accounts for the application. Fields include `username`, `email`, `passwordHash`, `role`, and an optional `profile` object.

### Transaction.js
Model for income/expense transactions. Fields: `type` (INCOME|EXPENSE), `amount`, `date`, `merchant`, `category`, `notes`, and `tags`.

### Budget.js
Monthly budget entries by category. Fields: `month` (e.g. "2025-10"), `category`, `limit`, and optional `notes`.

## graphql Folder

### TypeDefs.js
where you specify the structure of the data that can be queried or mutated
like what data will I be able to get? or what data can I create, update, or delete?
holds the schema for the queries and mutations

## resolvers Folder
the logic to fulfill the requests from the frontend
collects all the functions from the resolver files into one big list that the server can use  
### typename.js
write the specific functions that interact with your database to get, create, update, or delete data.
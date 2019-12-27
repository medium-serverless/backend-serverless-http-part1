Finished repo for tutorial: [Deploying a medium.com clone serverlessly for learning and profit. Part 1: backend
](https://dev.to/larswww/deploying-a-medium-com-clone-serverlessly-for-learning-and-profit-part-1-backend-1dg)

### Prerequisites 

To deploy this app you need an aws account, and the serverless framework configured with your aws account. [Follow
 these instructions](https://serverless.com/framework/docs/getting-started/)


### Get started

```
git clone https://github.com/medium-serverless/backend-serverless-http-part1.git
npm install
```

Mongodb needs to be installed and running on your machine: `mongod`. Then run the project locally with `serverless
 offline --skipCacheInvalidation`

### Deploying to production

This project uses [serverless dotenv plugin](https://www.npmjs.com/package/serverless-dotenv-plugin) to manage
 environment variables. You need to create a production .env files before you run the project in production.
 
Create a file named .env.production in your root directory with the following variables:
 
```
NODE_ENV=production
SECRET=keyboardCat
MONGODB_URI=mongodb+srv://username:password@cluster-domain.mongodb.net/test?retryWrites=true&w=majority
```

The above uses a [MongoDB Atlas](https://cloud.mongodb.com/) connection string, but you can of course connect to
 mongodb hosted anywhere. 

Once .env.production is configured deploy with this command: `NODE_ENV=production serverless deploy`. Running
 serverless deploy prefaced with NODE_ENV=production will cause serverless to also upload the env vars in .env
 .production
 

### Run tests

Either use the postman gui or use newman (included as a dev dependency)

Using newman to test locally. Make sure the app is running using `serverless offline --skipCacheInvalidation` then;
```
 npx newman run test/Conduit.postman_collection.json
```

To run the test suite against your production deployment, first edit the `Conduit.production.postman_environment.json
` in the test folder;

```
{
	"id": "f7623382-67ff-4024-b96b-f240870078a0",
	"name": "Conduit.production",
	"values": [
		{
			"key": "APIURL",
			"value": "ADD_YOUR_PRODUCTION_API_URL_HERE/api", <--- Add the endpoint url you recied when you deployed!
			"enabled": true
		}
	],
	"_postman_variable_scope": "environment",
	"_postman_exported_at": "2019-12-27T15:07:43.293Z",
	"_postman_exported_using": "Postman/7.14.0"
}

```
After you've edited the environment run the newman suite with it specified:

```
 npx newman run test/Conduit.postman_collection.json -e test/Conduit.production.postman_environment.json 
```


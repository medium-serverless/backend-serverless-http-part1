Finished repo for tutorial: [Deploying a medium.com clone serverlessly for learning and profit. Part 1: backend
](https://dev.to/larswww/deploying-a-medium-com-clone-serverlessly-for-learning-and-profit-part-1-backend-1dg)

In this tutorial series I'm refactoring [The mother of all demo apps - Real World](https://github.com/gothinkster
/realworld) by [thinkster.io](https://thinkster.io/) into a fully serverless app on aws as a fun learn-aws and
 exploration project. In Part 4 I'm refactoring one single endpoint in the express app into a lambda. The latest
 part of the tutorial is always what is running on [mediumserverless.com](https://mediumserverless.com).

### Prerequisites 

To deploy this app you need an aws account, and the serverless framework configured with your aws account. [Follow
 these instructions](https://serverless.com/framework/docs/getting-started/)


### Get started
You need to clone this repo and the [Node/Express flavor of Real World example app](https://github.com/gothinkster
/node-express-realworld-example-app). Installing dependencies for both, and updating two packages in the Real World
 repo.
```
git clone https://github.com/medium-serverless/backend-serverless-http-part1.git .
npm install
git clone https://github.com/gothinkster/node-express-realworld-example-app.git app && cd app
npm install
npm install --save mongoose@latest mongoose-unique-validator@latest
```


### Running locally

`sls offline --skipCacheInvalidation` will run the project using serverless offline.


### Deploying to production

Create a file named .env.production in the root dir and att the below:
```
NODE_ENV=production
SECRET=keyboardCat
MONGODB_URI=mongodb+srv://username:password@cluster-domain.mongodb.net/test?retryWrites=true&w=majority
```
Replacing the MONGODB_URI value with a [MongoDB Atlas](https://cloud.mongodb.com/) connection string, or mongodb
 database hosted elsewhere (atlas has a free tier though).

Deploy with: `NODE_ENV=production serverless deploy`. Running serverless deploy prefaced with NODE_ENV=production
 will cause serverless to also upload the env vars in .env.production
 

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


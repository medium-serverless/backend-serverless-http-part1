**In this tutorial we'll deploy a clone of Medium.com serverlessly. By taking an existing traditional "serverfull" app, that is more more real-world than your typical todo-app, you will learn the differences that going serverless entails, which will translate into real skills running your own projects.**

The Medium.com clone we'll use is ["The Mother of all Demo Apps" - RealWorld Example Apps](https://github.com/gothinkster/realworld). It comes in a variety of different languages and frameworks and is all about teaching you *how to code a medium clone*. ***So here's how to deploy it!*** I didn't code this app i'm just deploying it serverlessly with you :)

Learning serverless will help you get your own projects running live for free, with minimal maintenance and less development effort! It does require a change in thinking so refactoring a traditional web-framework app should make that change easy for you. 

***let me know in the comments*** if you're stuck or something isn't clear! I will reply. 

## Wait but why?

* If you code in JavaScript, Java, Python, .NET, Ruby or Go; RealWorld also has Example Apps in these languages and the serverless tools & concepts you learn here applies to all languages
* Any web project regardless of backend will involve JavaScript in the frontend hence why the serverless tools used in this tutorial is useful for any web app developer
* Taking a web-framework app, Express.js, which isn't really meant for Serverless, is a great way of understanding Serverless for someone who already understands something like Express, Spring or Flask
* The end-result here is how you would deploy a Server Side Rendered Static Front-End ***serverlessly***. So something like Next/Nuxt. It's also how to use JavaScript web-frameworks in the serverless world, meaning perhaps existing projects you have, or the vast ecosystem of plugins and libraries that exist for these. 




So at the end of this tutorial you will have a good base understanding of serverless and another useful tool in your web app programming belt! 



## TL;DR

This tutorial is --verbose in order to properly relay all the concepts behind serverless. However you could skip all that and just [go straight to the repo](link with the final code. 



## Serverless 101 - Get our backend running in on aws 

Let's deploy the most popular of the RealWorld Example App backends; [Node Exress RealWorld Example App](https://github.com/gothinkster/node-express-realworld-example-app). It uses MongoDB and Mongoose, not anything serverless-specific like DynamoDB. This is 3 years old code designed for Serverfull - not a serverless happy path scenario! We'll run into problems and bugs, which is great because then you'll learn how to debug problems when they show up in your own project. 


### Get the project running on your machine

Create a new folder on your machine for this project. Fire up your terminal; then let's clone the [Node Express RealWorld Example App](https://github.com/gothinkster/node-express-realworld-example-app), into it's own folder named app, and change directory into it:

#### 1

```
git clone https://github.com/gothinkster/node-express-realworld-example-app.git app && cd app
```

Now let's go through the install instructions in the Express RealWorld README.md that you just cloned:- -

- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- `npm run dev` to start the local server

Does the console print "Listening on port 3000"? Good! If not make sure you've followed the above steps properly.

### Let's run the RealWorld Test-Suite 

RealWorld example apps all come with the same [Postman](https://www.getpostman.com/) collection, which is handy because now we have a whole test suite to run against our serverless app. This link will open the test suite in postman for you; [![Run in Postman](https://run.pstmn.io/button.svg)](https://app
.getpostman.com/run
-collection/171f064e57fe69cc21ce) (or use it to download the JSON file and run it with newman, the command line version of Postman). 

#### 2

When you run the test suite 239 tests will pass and 44 fail. We'll fix that later :) If you're at 239/44 you're good to go. 



IMAGE



Please note that I'm using the linked ***updated*** postman suite above and not the one included with the repo. 


### Run this entire app in a single lambda

What is a Lambda? ***It's a function that runs in the cloud.*** We'll drop this entire app into a lambda. Why? Well, mostly because it's a fantastic way of understanding how this whole thing works, and the power of it. Is it a good way to deploy an app like this? Kind of! 

First off, running your app this way means that it's free. No fixed cost. Until you have *a few hundred users per day* it's going to be cheaper than a $5/m VPS. If you have zero users, or just a few hundred a month, it's free. I'm being a bit vague because really it isn't free, nothing ever is. It's *pay for what you use*. And you need _a lot_ of use before it starts costing you anywhere near a traditional server approach. 

So for projects that are just getting started, or for your experiements, or for your programming portfolio, it's great because you can leave it all running and be the dev with a bunch of production apps, instead of just a bunch of outdated repos. It also means that you don't need to have a project that is "good enough to spend money on" in order to put it live, and have Google start indexing it. You can work in an agile way and constantly update your live, on the internet app as it gets better and better! Having something live, and seeing some actual use, is very motivating as a programmer :)

But most of all, this is if you don't really like "devops". You're not into configuring servers, nginx, ssh'ing, proxies, linux, docker, and all that. You just want to code stuff that is about your idea, and have the code run in production without leaving your editor. 

### How to configure the AWS cloud and deploy without leaving your editor

You could use the web interface of AWS to do all of this, but that is very tedious and then you have to *leave your editor* and repo, and that's bad for your productivity and worse than "dealing with servers" if you ask me.



IMAGE



You could use AWS CloudFormation templates to configure aws in your editor, however CloudFormation is very powerful, more complicated and AWS-specific. Enter [Serverless](https://serverless.com) a command-line tool to help simplify your Serverless day-to-day . Think of it as a simplified, 80/20 version, that in no way limits you to configure the more niche scenarios separately once you need them.



IMAGE




### Serverless *Events* - the thing that calls your function

So if we have a function in the cloud, what is going to call it? Events. The most common event is a HTTP event - like a GET or POST request, which is what we'll use for our express app, but it could also be a scheduled time, or whenever a file gets saved somewhere, or another function. Have a look at [Serverless AWS Events](https://serverless.com/framework/docs/providers/aws/events/) for an idea if you wish :)


### Handlers - functions that can be called by events

The handler is your entry point for each event, i.e. the function that gets called by the event. It always recieves the same two arguments from AWS; event, and context. Have a look at a [sample HTTP Event in the AWS Docs](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html)! Whilst you're there, you could also check out all the other available events :) 

The context object contains info about the environment your function runs in. You're not going to use it much for now, learn about it later! Or [Read about Context in AWS docs](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html)

## Refactoring our App.js file into a Handler function

*Normally you don't need a web-framework like Express, Spring or Flask in a Serverless app.* AWS does all of the web-framework and it's related stuff for you with API Gateway. And that's a good thing, because it means you don't have to implement all that stuff with code when you're using Serverless. Instead you can focus on coding business logic. However, our app is already built and coupled to a JavaScript web framework, Express.js. What good is a "function in the cloud" if you can't run your code in it? Well, we can :)

We're going to use the proxy type of lamdba. Basically, it means API Gateway will get out of our way, and proxy everything to our lamdba, so that Express can do the routing and all web-framework stuff as usual.

Now we could code our own "bridge" to make express understand API Gateway's proxied HTTP event, however someone has already done it. I just wanted you to understand what it does :) It's called [serverless-http](https://github.com/dougmoscrop/serverless-http)

#### 3

Let's edit our app.js file to export the express app instance. At the bottom of app/app.js add the export:

```javascript
module.exports = app
```

Then head back to your ***project root*** where we'll be working and setup the project:

```
npm init -y
touch handler.js
```

Your project should now look like this:

````
.
├── app							<-- folder with the RealWorld repo we cloned with all its files
├── node_modules		
├── handler.js			<-- file you just created with 'touch handler.js'
├── package.json		<-- your dependencies for serverless deployment
````

In your handler.js file lets import the express app, load serverless-http and export a lambda handler:

```javascript
const serverless = require('serverless-http')
const app = require('./app/app.js')
const ourExpressApp = serverless(app)
module.exports.handler = async (event, context) => {
  // this is before your express app/code runs
  let result = await ourExpressApp(event, context)
  // here express' work is done and ready to reply
  return result
}
```

In terms of code changes, this is all we need to make things run! But how do we get this code to AWS? What IP, or URL is our app going to run at?

## Configuring aws directly from our Editor

The Serverless command line framework will essentially let you configure AWS, Azure, Google Cloud etc without leaving your editor! It's a huge productivity boost and will ***massively*** simplify your serverless journey. 

#### 4 

Enter the almighty Serverless.yml file. If you've used Docker before, think of it as a docker file for cloud. Create a file called serverless.yml file in your root project directory.

```
touch serverless.yml
```

In this file you configure eeeeverything to do with your app and deployment. We are also going to use it to run our app locally. 

```
service: serverless-express

provider:
  name: aws 
  runtime: nodejs12.x 
  stage: dev 
  region: eu-central-1 

plugins:
  - serverless-offline

functions:
  expressApp:
    handler: handler.handler
    events: 
      - http: ANY / 
      - http: 'ANY {proxy+}' 

```

Please note that the indentation and the hiearchy is important in a yml file. So what are we specifying here?

#### Provider
We want to deploy to AWS and we want the functions specified later in this file to run in a Node.js version 12.x environment. You could also specify Node 10.x or 8.x, or [.NET, Go, Python, Java or Ruby, read more in the AWS Runtime docs](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html). We're going to deploy to a  [You can learn more about stages here](https://serverless-stack.com/chapters/stages-in-serverless-framework.html)

***however*** please make sure your machine is running the same version of node! I.e. 12. Check by typing `node -v` in your terminal. Later when we run the project offline we want the same version as production. You can use [node version manager](https://github.com/nvm-sh/nvm) to handle different versions of node. 

#### Plugins
There are a ton of plugins you can use to make the serverless life easier. The first one we'll be using is serverless-offline, it'll enable us to run our app locally in an emulated aws environment.

#### Functions
This is where the magic happens. This is where we link our handler to an event. So we're naming our function expressApp, and it's handler is located in the file named app that exports the function named handler. 

For our events, we've responding to two http events. The first one is for the base path of our domain, i.e. ourdomain.com/ the second for any other path to our domain (such as ourdomain.com/anything, ourdomain.com/any/thing, ourdomain.com/any?&someQueryParam=anything) etc. 


## Let's try it

#### 5

If you haven't already, you will need serverless installed as a global npm package

```
npm install -g serverless
```

Then lets install some of the dependencies we added:
```
npm install --save serverless-http
npm install --save-dev serverless-offline
```
Make sure the app you started previously is shut down then let's run our app locally with this command:

```
serverless offline
```

Then you should see among other things see the below message in the console to indicate your app is running:

```
Serverless: Offline [HTTP] listening on http://localhost:3000
```



#### Run the Postman test suite again

Let's run our test-suite against the serverless version of our express app to make sure things are working. In your terminal you should see a bunch of log output from the app as you run the test suite. Scrolling to the first function call you should see this:

```
Serverless: ANY /api/users (λ: app)
 Listening on port 3000
 Mongoose: users.ensureIndex({ username: 1 }) { unique: true, background: true }  
 Mongoose: users.count({ '$and': [ { username: 'johnjacob' } ] }) {}  
 Mongoose: users.count({ '$and': [ { email: 'john@jacob.com' } ] }) {}  
 Mongoose: articles.ensureIndex({ slug: 1 }) { unique: true, background: true }  
 Mongoose: users.ensureIndex({ email: 1 }) { unique: true, background: true }  
 POST /api/users 422 87.421 ms - 71
```
So our app is receiving the request, some of our code is being executed, as we can see the debug log output from mongoose, and then our app replies with response code 422 - "unprocessable entity", which is not the response code we want.

In the next request and all subsequent ones, we get the following error:
```
Serverless: Error while loading app
 Error: Trying to open unclosed connection.
     at NativeConnection.Connection.open (...your directory/Serverless Tutorial/serverless-http/node_modules/mongoose
     /lib/connection.js:236:15)
```
So our first request works, but not our subsequent ones? Why? In short because serverless offline reloads our code for each http event. This is to help during development so that you don't have to restart the app as you update your code. Normally this won't case you any issues, however in our case it means the entire app.js file is being loaded fresh with each test case, hence the trying to connect() to mongoose again. So this problem would not happen in production.

#### 6

let's run serverless offline without the code reloading;
```
serverless offline --skipCacheInvalidation
```
Try running the test cases again and you should be back to 239 passed and 44 failed :) So let's deploy this to production! 

## Deploying our backend to production

Before you can deploy this to production you need serverless configured with your aws account. If you haven't set this up already, [just follow this guide](https://serverless.com/framework/docs/providers/aws/guide/credentials#setup-with-the-aws-cli) . I recommend doing it with the aws-cli since it's handy to have on your machine as a serverless dev but whichever method you prefer.

#### 7

```
serverless deploy
```

It should start working, "Packaging service..." then eventually;

```
...............................
Serverless: Stack update finished...
Service Information
service: serverless-express
stage: dev
region: eu-central-1
stack: serverless-express-dev
resources: 12
api keys:
  None
endpoints:
  ANY - https://1337dprixv2a.execute-api.eu-central-1.amazonaws.com/dev
  ANY - https://1337dprixv2a.execute-api.eu-central-1.amazonaws.com/dev/{proxy+}
functions:
  expressApp: serverless-express-dev-expressApp
layers:
  None
```

Under "endpoints:" you can see your production API url! Let's run our test-suite against this url to see if everything works. 

### Testing our production deployment

Our postman suite is configured to run against localhost:3000/api. We need to change that to the endpoint aws generated for us. We'll do that by adding a postman environment, so that we easily can switch between local and production. 


*Don't forget to add /api to your endpoint! Otherwise you'll get 404 not found as our express app expects all routes to be prefaced with /api!*

https://1337dprixv2a.execute-api.eu-central-1.amazonaws.com/dev/api

**images**

*Now lets run our test suite as normal*! 

Aaaand.. all tests fail. Each of them gives 502 Bad Gateway. 

### Checking our apps log output

Let's open the log for our function named expressApp and run our test suite 
```
serverless logs -f expressApp
```
Your terminal should now be filled with the log output from your app! With many entries like these:

```
START RequestId: 7fbfff1b-a8b6-4e77-9da6-7de379413f3f Version: $LATEST
2019-12-20 15:24:51.520 (+01:00)        11404faa-0677-4a74-9e81-1f99c1d86f41    Listening on port 3000
2019-12-20 15:24:51.553 (+01:00)        7fbfff1b-a8b6-4e77-9da6-7de379413f3f    Error: connect ECONNREFUSED 127.0.0.1:27017
    at Object._errnoException (util.js:1022:11)
    at _exceptionWithHostPort (util.js:1044:20)
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1198:14)
END RequestId: 7fbfff1b-a8b6-4e77-9da6-7de379413f3f
REPORT RequestId: 7fbfff1b-a8b6-4e77-9da6-7de379413f3f  Duration: 81.13 ms      Billed Duration: 100 ms Memory Size: 1024 MB    Max Memory Used: 74 MB  

RequestId: 7fbfff1b-a8b6-4e77-9da6-7de379413f3f Process exited before completing request
```
You can probably figure this one out, the clue is in " Error: connect ECONNREFUSED 127.0.0.1:27017". 

In our app.js file we've got this:

```javascript
if(isProduction){
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/conduit');
  mongoose.set('debug', true);
}
```

So we need to set two environment variables, isProduction and MONGODB_URI. 

### Environment variables in Serverless

Here are tree ways to handle environment variables in a serverless project. For a more detailed look at environment variables have a look at this excellent article; [Managing multiple environments with Express & Serverless Framework](https://sangeeta.io/2019/05/01/express-serverless/) by Sangeeta Jadoonanan.

#### In our Serverless.yml file

```
  expressApp:
    handler: app.handler
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://... etc
    events:
      - http: ANY /
      - http: 'ANY {proxy+}'
```

Setting environment variables either under each function block, or in the provider: section to apply for all your functions. The problem here is that if your environment variables are sensitive, then you'll save them in cleartext.. and perhaps accidentally push them to github. Our production database connection string will be sensitive, so this method is not great for us.

It also means your production environment and serverless offline will share environment variables, which is probably not what you want. 

(this is wrong, can offer you more granular control etc)

#### Directly in our lambda

If you have very sensitive environment variables, or few/ones you won't need to edit frequently, you can add them directly to your Lambda using the aws console. The interface also has functionality to encrypt them. For our single mongodb connection string containing username and password to our production db, this would be perfect. This connection string isn't going to change, and we only have a single lambda using it so no need to manually add it to several lambdas. However, this might limit you in some of your own projects, so i'll use the third option below for the purpose of this tutorial. 


#### Using .env files

We can use the serverless-dotenv plugin which will let us have different .env files for development and production. This is a somewhat more secure since files starting with . are hidden on your system and we can add it to our .gitignore to avoid pushing these values to git accidentally. 

```
npm install --save-dev serverless-dotenv-plugin
```
Add the plugin in your serverless.yml:

```
plugins:
  - serverless-offline
  - serverless-dotenv-plugin
```

Then create two .env files:

```
touch .env
touch .env.production
```

*don't forget to add .env to your .gitignore file!*

The .env will apply if we haven't specified an environment when running the app and the .env.production will apply if NODE_ENV is set to production. 



### Connecting to our MongoDB Atlas production database

How do you install, deploy and maintain a database to perfection? For free? You don't! Let the creator of the database take care of it. To get our production db connection string head over to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a database, add 0.0.0.0 to the IP whitelist (so that you can connect from anywhere) and create a read/write user. For a detailed step-by-step on how to do that checkout [Free Tier Serverless MongoDB with AWS Lambda and MongoDB Atlas](https://mattwelke.com/2019/02/18/free-tier-serverless-mongodb-with-aws-lambda-and-mongodb-atlas.html) by Matt Welke.

Open up your .env.production and set your NODE_ENV, SECRET and MONGODB_URI environment variables:

```mongodb+srv://<username>:<password>@cluster0-zrpie.mongodb.net/test?retryWrites=true&w=majority
NODE_ENV=production
SECRET=keyboardCat
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0-zrpie.mongodb.net/test?retryWrites=true&w=majority
```

replacing <username>:<password> with ones from the user you created. 

Since we are connecting to the latest version of MongoDB on Atlas we'll need to update mongoose and mongoose-unique-validator:

```
npm install --save mongoose@latest mongoose-unique-validator@latest
```

Now let's deploy our updated app with the serverless environment set to production:

```
NODE_ENV=production serverless deploy 
```

You should see serverless working on deployment and mentioning the inclusion of your MONGODB_URI environment variable:

```u
Serverless: DOTENV: Loading environment variables from .env.production:
Serverless:      - MONGODB_URI
Serverless: Packaging service...
Serverless: Excluding development dependencies...
...
```

Let's *tail* (stream) the logoutput of our production app: 

```
 serverless logs -f expressApp -t
```

Now run the Postman test suite ! You should have 280 passing tests and 23 failed. If you're observant you'll notice we're passing more tests than before and that's because we updated mongoose. 

# What you just deployed on aws

You're in the cloud! Let's take a look at all the stuff the Serverless Framework configured on AWS for you. Long onto [console.aws.amazon.com](https://console.aws.amazon.com). Make sure you have the same region selected as in your Serverless.yml. 

Your app uses Lambda, API Gateway and CloudWatch. Search to find each service:

#### API Gateway

This is Amazons "web framework" as a service. In our case, it's not doing much (yet), and simply forwards all http events as they are to our express app. However, it could do a lot, such as integrate with a CDN, throttling & rate limiting, input validation, API keys.. 



#### Lambda

Your one function running the app. 



#### CloudWatch

Here you can find all logs for your app, and also usage metrics. 





# Next steps

We've got the backend deployed, now let's deploy the front-end, connect it to our backend, and host it all with a custom domain, using https and a global content delivery network. For free! (except for the domain, those cost money also in the serverless world).








# Real World Serverless: Part 4 - From Express.js route to AWS Lambda API

*In this tutorial series I'm refactoring a node.js/express/mongodb clone of medium.com into a serverless app. You can view the deployed result at [https://mediumserverless.com](https://mediumserverless.com). You can learn more about the medium clone here; ["The mother of all demo apps" — Exemplary fullstack Medium.com clone powered by React, Angular, Node, Django, and many more ](https://github.com/gothinkster/realworld)*

In Part 4 I'm refactoring one single API endpoint for the entire medium app into a deployed lambda. In the end, you will have the same amount of code, with the difference that the *deployment* of the app is included with that code. The cool kids call it ***infrastructure as code***

#### What you'll learn

* How to do with AWS Lambda & API Gateway what you normally do with a web framework like Express, Flask or Spring.
* Simple, clean and effective input validation for any AWS API using JSON Schema.
* How to handle errors consistently, with minimal effort and zero code clutter.
* Deploy with one command and leave it running for free.

Because we are *configuring* these things instead of implementing them in code, what you'll learn will also work in any [programming language that AWS supports](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) 💪⭐️ (JavaScript, Python, Ruby, Java, Go and .NET)

### 1. Clone repo from Part 2

If you haven't followed along Part 1-3 you can still jump in here and follow along just fine. But I do recommend going from the beginning if you really want to learn how the whole serverless thing works. 

Create a new directory for this tutorial and clone the backend from Part 2 into a new directory:

`git clone https://github.com/medium-serverless/backend-serverless-http-part1.git .`

Then clone the original Real World Demo App into the app folder

`git clone https://github.com/gothinkster/node-express-realworld-example-app.git app`

Then open upp app/app.js and add export the app so that the handler we created in tutorial part 2 can use it.

```javascript
... the entire app.js file unchanged
module.exports = app // <-- just add this at the bottom!
```

The Repo you just cloned contains an entire app. We're going to refactor one small part of this app into a proper serverless lambda api function, and still run the rest of the app serverlessly alongside it. Easier than it sounds I promise.



### 2. Refactoring our first endpoint

Let's start at the top. Let's take the below express.js callback/endpoint located in app/routes/api/users.js and turn it into a lambda!

```javascript
var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');

router.post('/users', function(req, res, next){
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

module.exports = router;

```

Create a src directory in the root of the project. All our new fancy lambda-stuff is going to be placed here. Within src, instead of a "routes" directory, lets have a "handlers" directory. 

```javascript
// src/handlers/api/users.js
const mongoose = require('mongoose')
const User = mongoose.model('User')
mongoose.connect(process.env.MONGODB_URI) // 1

module.exports.postUsers = async (event, context) => { // 2
  const user = new User()

  user.username = event.body.user.username
  user.email = event.body.user.email
  user.setPassword(event.body.user.password)

  user.save().then(() => {
    return { user: user.toAuthJSON() } // 3
  }).catch(() => {
    return { statusCode: 400 } // 4
  })
}
```

Let's briefly go over the differences before we plug this in. From top to bottom:

1. We connect to the database within this file so that the function is independent from the rest of the app.
2. Since we are running Node.js 12.x we can use ES6 syntax without babble. Instead of connecting a callback function into the express router we are simply exporting a regular async function.
3. We are simply returning regular JavaScript objects instead of passing objects into callbacks. Returning a regular JavaScript object will result in a 200 response code with that object as a JSON body automatically. 
4. Returning { statusCode: 400 } will result in an empty http response with a 400 code. 

Don't worry about the error handling, we'll deal with that later. (Later !== never in this case)

### 3. Adding our function to Serverless.yml

Lets configure this function as an API endpoint by adding it to our serverless.yml located in the project root dir.

```yaml
service: serverless-express

provider:
  name: aws
  runtime: nodejs12.x
  stage: dev
  region: eu-central-1

plugins:
  - serverless-offline
  - serverless-dotenv-plugin

functions:
  expressApp:
    handler: handler.handler
    events:
      - http: ANY /
      - http: 'ANY {proxy+}' 
      
   # Adding our new function here!
    usersPost: 
     handler: src/handlers/api/users.postUsers 
     events: 
       - http: 
           path: /api/users
           method: post
           integration: lambda
```

I think the serverless.yml additions are pretty self explanatory? Let me know in the comments if not!

That is all you need to configure *and deploy* your route! Now any POST request to mediumserverless.com/api/users will be directed to our new fancy lambda. Any other call will be directed to the expressApp. So our old express app and our new lambda can co-exist :)



//TODO put the .env's in the previous repo

### 4. Let's test it

Make sure all dependencies are installed with `npm install` in both the root directory and the app directory. You can then run the project on your local machine with`sls offline --skipCacheInvalidation` and you should see it running:

```
Serverless: Routes for expressApp:
Serverless: ANY /
Serverless: ANY /{proxy*}
Serverless: POST /{apiVersion}/functions/serverless-express-dev-expressApp/invocations

Serverless: Routes for usersPost:
Serverless: POST /api/users
Serverless: POST /{apiVersion}/functions/serverless-express-dev-usersPost/invocations

Serverless: Offline [HTTP] listening on http://localhost:3000
Serverless: Enter "rp" to replay the last request
```

So the express app will handle any http call ***except*** for POST requests to /api/users which will be handled by our usersPost function. Meaning that our old app and new fancy lambda is co-existing.

The repo you cloned comes with a potman collection located in folder test in root dir. Open up the  test suite in [Postman](https://getpostman.com) and run the test in Profiles called 'register celeb' and it should pass. If you have problems running the test checkout [part 2 of this tutorial which covers how run the test suite]()



### 5. Deploy

Let's update our production app! Because `service: serverless-express` is defined at the top of our Serverless.yml even though we are in a different repo now you're still going to update the same service. 

`NODE_ENV=production serverless deploy`

You will recieve an AWS generated URL for your api. Now try running the test with the Postman environment set to production and things should work. (Remember to change the postman production environment varialbe url to the one you just recieved, checkout [this section in part 2 of the tutorial] if you need details on how to do this.)  

Since you now have two functions, one for the entire express app, and one for usersPost, you can stream logs for these individually with `serverless logs -f postUsers -t` and `serverless logs -f expressApp -t`. This will stream the log output of your production function to your terminal. 



### [FYI] Input Validation

You may have noticed that the original code makes no attempt to check the validity of the input, i.e. the password, username and email. If you call our endoint without these as empty strings, you will actually be able to register a user with "" as username and e-mail. If you are running this in production, eventually someone will try to mess with you. Lack of input validation is a guaranteed nightmare. 

There is *some* validation in the Mongoose model;

```javascript
 var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
  email: {type: String, lowercase: true, unique: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
  bio: String,
  image: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  hash: String,
  salt: String
}, {timestamps: true});

```

However, you can still input an empty string (No idea why, but you can..). Also you can have an insanely long email or username, which could break your frontend ui. 

But that's not really the issue here. The issue is that ***validating your input is a cross-cutting concern***. It applies to most of your functions, not just mongoose. In functions without mongoose, you would need to come up with different validation. And then your validation logic is spread all over your app and done in different ways.

You might be tempted to write code like this;

```javascript
const { username, email, password } = {...event.body.user}
if (!username || !email || !password) return {statusCode: 422}
```

Great! Solves our first scenario. But what if the username is really short? Or outrageously long? Or a number? And you still need to implement proper logic for making sure you're getting an actual email! So you start adding all that as well and soon you have *more validation logic than business logic*. Not fun! And you have to write this type of code for all your other api endpoints too. This will slow you done.

***Implementing validation logic in code is a terrible idea***:

* It's boring code to write
* It clutters your codebase
* You are going to make mistakes 

What you want is being able to just trust that the input you get into your lambda meets a certain specification. A certain ***Schema***.

### 6. Input Validation with JSON Schema

In any web app (more or less), you are going to be dealing with a lot of JSON. Sending, recieving, storing it etc. So the ideal solution is to define what our user object is allowed to look like in a separate [JSON Schema](https://json-schema.org). We're then going to link to that schema in our Serverless.yml and simply reject any http request that doesn't conform to our schema. Meaning; we can be confident that our function has the input we expect.

Let's create a schema for our user object and place it in a separate file/folder far away from our business logic:

```json
// src/schemas/newUser.json
{
  "type": "object",
  "properties": {
    "user": { // so we're specifying a nested object
      "type": "object",
      "properties": {
        "username": {
          "type": "string",
          "minLength": 3,
          "maxLength": 20 
        },
        "password": {
          "type": "string",
          "minLength": 6,
          "maxLength": 100
        },
        "email": {
          "type": "string",
          "format": "email" // a built in format, you could also use a REGEX
        }
      },
      "required": ["username", "password", "email"]
    }
  },
  "required": ["user"]
}
```

I don't think I need to explain the schema since JSON Schema is very human-readable! Now simply plug it into our endpoint via Serverless.yml:

```yaml
usersPost:
     handler: src/handlers/api/users.postUsers
     events:
       - http:
           path: /api/users
           method: post
           integration: lambda
           request:
             schema:
               application/json: ${file(src/schemas/newUser.json)}
```

That's it! Now deploy the app again and try calling the endpoint with a bunch of bad inputs. (Serverless Offline *does not* implement JSON schemas, so you have to try against production) You will recieve a 422 "bad request" response and ***your function won't even be called***. This is important; with Lambda you pay based on invocation and usage, not having your function invoked with bad inputs is therefore a good thing.

The easy way to craft your own JSON Schema is simply to scroll through the [JSON Schema Reference](https://json-schema.org/understanding-json-schema/reference/index.html) for whatever type you're trying to validate (number, strings etc), then go from there. You'll get the hang of it very quickly. 

As a bonus, you could use this same schema to validate the create user form on the front-end; effectively making the JSON Schema a contract between your front and backend. 



### 7. Error Handling

We've saved ourselves a bunch of annoying error handling by validating the input to our lambda. But what about errors that happen even though the input is valid?

This sucks:

```javascript
 user.save().then(() => {
    return { user: user.toAuthJSON() }
  }).catch(() => {
    return { statusCode: 400 }
  })
```

* Needing to catch directly in our lambda clutters the code
  * Ideally we just want to be able to throw errors and have those taken care of automatically
* We have to set the status code directly in the lambda 
  * As you're implementing the frontend and documenting your code, should things get that professional, it'll be very annoying to keep track of the various status codes



#### What We Want

```javascript
await user.save()
return { user: user.toAuthJSON() }
```

* To not have to have to handle the error with .catch() as it'll clutter our code
* For a proper response code to be returned (200), without needing to set that in our lambda
* Since save() will be used by other functions in other API endpoints, we want those to handle the error as well
* Minimal effort
* A consistent approach to handling the various errors that arise so we can focus on writing *business logic* and still have decent error handling. 

In software design that's called the cake and eat it pattern. 



Now save() is a method from an external dependency (Mongoose).  If a username or e-mail already exists it will throw `Error [ValidationError]: "User validation failed: username: is already taken., email: is already taken."`  with some variation, depending on what already existed. Lambda will map **all** uncaught errors to below standard format and respond with code **500 - Internal Server Error** due to the built in error handling when calling lambda from API Gateway (since we are calling the function with a http event, that means API Gateway).

```javascript
{
    "errorMessage": "User validation failed: username: is already taken., email: is already taken.",
    "errorType": "MongooseError",
    "stackTrace": [
        "ValidationError: User validation failed: username: is already taken., email: is already taken.",
        "at new ValidationError... embarrasing stack trace goes here
    ]
}
```

You can read more about [Handling Standard Lambda Errors in API Gateway in the AWS docs here](https://docs.amazonaws.cn/en_us/apigateway/latest/developerguide/handle-errors-in-lambda-integration.html)

#### Solution 

We'll solve this via Serverless.yml.

```yaml
  usersPost:
    handler: src/handlers/api/users.postUsers
    events:
      - http:
          method: post
          path: /api/users
          integration: lambda
          request:
            schema:
              application/json: ${file(src/schemas/newUser.json)}
          response: ### ADDED STUFF HERE
            headers: #1
              Content-Type: "'application/json'"
            statusCodes: 
               200: #2
                pattern: .*is already taken.*
                template: #3
                  application/json: ${file(src/errors/error-response-template.yml)}
               201: #4
                pattern: ''
             
```

1. You can apply the below to one or several content types, my api will only use JSON so i'm leaving it at that. But FYI you can also have different responses and templates based on headers. 
2. We define that a 200 response code should be returned if the pattern matches the Regular Expression /.*is already taken.*/g. The pattern will be tested against the errorMessage property of our lambdas return value, which as you might recall is what our Lambda will put the error message under for *any uncaught error*
3. We want that 201 response to follow a particular pre-formatted template which we've defined in an external file. (I'll show you below)
4. Here I'm changing the **default** non-error response code to 201 CREATED. Originally, the app returned 200 OK, however a POST where a user is successfully saved, created, should return 201. By applying the '' empty pattern, this will be the response whenever no other pattern has matched. 

/src/errors/error-response-template.yml:

```yaml
'{
  "message": $input.json("$.errorMessage")
}'
```

Will result in the below 200 OK reply:

```json
{
    "message": "User validation failed: email: is already taken., username: is already taken."
}
```

No stack trace, no status 500. 

*You now have error handling of this this save() error that you can easily add to any api endpoint that uses save()*. With just one function that doesn't matter so much, but as your application grows, being able to consistently and simply handle errors like this, away from your code, will be a boon to your productivity. You also have all your error codes documented in one place, so it's easy to see in one consistent place what different codes and errors your backend might return. Your frontend developer will appreciate this. 

If throwing your own error you could do something like this:

```javascript
throw new Error(JSON.stringify({code: '[422]', someProperty, someVar, otherUsefulInfo}))
```

And have that handled by a standard code 422 template with any variables you include accessible by the template. So the error-response-template.yml is more powerful than what we've used it for so far. And you can do a lot more with it in order to format a good response. We'll get to that in later parts when we build on this powerful error handling strategy further :)



# Next Steps & Final Code

Checkout the final code from this tutorial in the [Github Repo](  s). I also recommend checking out the previous part if you want a full understanding of how to run real world apps serverlessly:

In part 5 of this tutorial I'm going to continue refactoring the Users part of the API. Specifically, I'm going to deal with authentication and authorization. Currently, that's all tangled up with our code and endpoints and  I want to do it with an authorizer function instead. 

Generally what I'm doing here is doing less and less things in code, and more in configuration. By configuring instead of coding the *boring stuff that all apps need*, those things can be done much quicker for your apps - and the deployment is taken care of. 
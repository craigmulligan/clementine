# Getting Started

First thing we need to do is create a graph and an ApiKey so you can start storing traces from your graphql server.

## Create a graph

Once you have a clementine instance running. Login in through the dashboard and create a new graph.

![Create a graph](Screenshot-1.png)

Then navigate to the graphs settings page and create an apiKey.

![Create a graph apiKey](Screenshot-3.png)

We only store a hash of the key so make sure you copy it down.

## Configure your server

Now configure your server to send traces to clementine.

This is what it looks like with ApolloServer:

```
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "<YOUR-API-KEY-HERE>",
    endpointUrl: 'https://<YOUR-CLEMENTINE-HOST>',
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${ url }`);
});
```

Now run some queries and the them populate in the clementine dashboard.

![graphView](TODO)

## Forwarding traces to Apollo Graph Manager.

If are trailing clementine and want to forward your traces to Apollo you can pass both the apolloKey and the clementineKey seperated by a `?`. For example:

```
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "<YOUR-CLEMENTINE-API-KEY-HERE>?<YOUR-APOLLO-API-KEY>",
    endpointUrl: 'https://<YOUR-CLEMENTINE-HOST>',
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${ url }`);
});
```

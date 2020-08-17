import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { setContext } from 'apollo-link-context';
import { getMainDefinition } from 'apollo-utilities';
import { SubscriptionClient } from "subscriptions-transport-ws"

const createApolloClient = () => {
  const connectionParams = () => {
    const token = localStorage.getItem('token')
    if (token) {
      return {
        headers: {
            Authorization: token
        }
      }
    } else {
      return {}
    }
  }

  const wsLink = new WebSocketLink(
    new SubscriptionClient(`ws://localhost:8080/v1/graphql`, {
      reconnect: true,
      lazy: true,
      timeout: 30000,
      connectionParams
    })
  );

  const httpLink = new HttpLink({
    uri: 'http://localhost:8080/v1/graphql',
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');

    if (!token) {
      return {}
    }

    return {
      headers: {
        ...headers,
        authorization: token,
      }
    }
  });

  const link = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  return new ApolloClient({
    link: authLink.concat(link),
    cache: new InMemoryCache(),
//    request: (operator) => {
//      const token = localStorage.getItem('token');
//      console.log('getting token', token)
//      operator.setContext({
//        headers: {
//          authorization: token ? `Bearer ${token}` : ''
//        }
//      })
//    }
  });
};

const client = createApolloClient()

export default client

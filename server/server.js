const path = require('path')
const express = require('express')
const server = express()
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
// routes
const auth = require('./routes/auth')

server.use(express.json())
server.use(express.static(path.join(__dirname, './public')))
server.use('/api/v1/auth/', auth)

module.exports = server

// GRAPHQL INITIALIZERS
const {
  getTodolists,
  addTodolist,
  updateTodolist,
  deleteTodolist
} = require('./db/fn/todolists')

const {
  getTodolistItems,
  addTodolistItem,
  updateTodolistItem,
  deleteTodolistItem
} = require('./db/fn/todolistItems')

var { graphqlHTTP } = require('express-graphql');
var {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull
} = require('graphql');

const ListsType = new GraphQLObjectType({
  name: 'list',
  description: 'This represents a list of a user',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    user_id: { type: GraphQLNonNull(GraphQLInt) }
  })
})

const ItemsType = new GraphQLObjectType({
  name: 'item',
  description: 'This represents an item of a list',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    item: { type: GraphQLNonNull(GraphQLString) },
    todolist_id: { type: GraphQLNonNull(GraphQLInt) }
  })
})

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    lists: {
      type: GraphQLList(ListsType),
      description: 'A list of lists',
      args: {
        user_id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        let dblists = getTodolists(args.user_id)
        return dblists
      }
    },
    items: {
      type: GraphQLList(ItemsType),
      description: 'A list of items',
      args: {
        todolist_ID: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        let dbitems = getTodolistItems(args.todolist_ID)
        return dbitems
      }
    }
  })
})

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'root mutation',
  fields: () => ({
    addList: {
      type: ListsType,
      description: 'add a list',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        user_id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const list = { name: args.name, user_id: args.user_id }
        let dblist = addTodolist(list, args.user_id)
        // console.log(dblist);
        return dblist
      }
    },
    addItem: {
      type: GraphQLList(ItemsType),
      description: 'add an item',
      args: {
        todolist_id: { type: GraphQLNonNull(GraphQLInt) },
        item: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const item = { item: args.item, todolist_id: args.todolist_id }
        return addTodolistItem(item, args.todolist_id)
      }
    },
    updateList: {
      type: ListsType,
      description: 'updates a list',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        user_id: { type: GraphQLNonNull(GraphQLInt) },
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const list = { name: args.name, user_id: args.user_id }
        let dblist = updateTodolist(list, args.id)
        // console.log(dblist);
        return dblist
      }
    },
    deleteList: {
      type: ListsType,
      description: 'deletes a list',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        let dblist = deleteTodolist(args.id)
        // console.log(dblist);
        return {
          id: dblist
        }
      }
    }
  })
})
// Construct a schema, using GraphQL schema language
const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})



server.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
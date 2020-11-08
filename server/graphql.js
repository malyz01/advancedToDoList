const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull
} = require('graphql')

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

// =============================
// ===========QUERY=============
// =============================
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
      resolve: (parent, args) => getTodolistItems()
    }
  })
})

// =============================
// ==========MUTATION===========
// =============================
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
    updateItem: {
      type: GraphQLList(ItemsType),
      description: 'updates an item',
      args: {
        item: { type: GraphQLNonNull(GraphQLString) },
        todolist_id: { type: GraphQLNonNull(GraphQLInt) },
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const list = { item: args.item, todolist_id: args.todolist_id }
        let dblist = updateTodolistItem(list, args.id)
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
    },
    deleteItem: {
      type: ItemsType,
      description: 'deletes an item',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        let dblist = deleteTodolistItem(args.id)
        // console.log(dblist);
        return {
          id: dblist
        }
      }
    }
  })
})

// EXPORT SCHEMA
module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})
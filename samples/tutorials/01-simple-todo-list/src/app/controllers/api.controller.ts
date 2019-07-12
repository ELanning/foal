import {
  Context, Delete, Get, HttpResponseCreated, HttpResponseNoContent,
  HttpResponseNotFound, HttpResponseOK, Post,
  ValidateBody, ValidateParams
} from '@foal/core';
import { getRepository } from 'typeorm';

import { Todo } from '../entities';

export class ApiController {

  @Get('/todos')
  async getTodos() {
    const todos = await getRepository(Todo).find();
    return new HttpResponseOK(todos);
  }

  @Post('/todos')
  @ValidateBody({
    // The body request should be an object once parsed by the framework.
    // Every additional properties that are not defined in the "properties"
    // object should be removed.
    additionalProperties: false,
    properties: {
      // The "text" property of ctx.request.body should be a string if it exists.
      text: { type: 'string' }
    },
    // The property "text" is required.
    required: [ 'text' ],
    type: 'object',
  })
  async postTodo(ctx: Context) {
    // Create a new todo with the body of the HTTP request.
    const todo = new Todo();
    todo.text = ctx.request.body.text;

    // Save the todo in the database.
    await getRepository(Todo).save(todo);

    // Return the new todo with the id generated by the database. The status is 201.
    return new HttpResponseCreated(todo);
  }

  @Delete('/todos/:id')
  @ValidateParams({
    properties: {
      // The id should be a number. If it is not (the request.params object
      // always has string properties) the hook tries to convert it to a number
      // before returning a "400 - Bad Request".
      id: { type: 'number' }
    },
    type: 'object',
  })
  async deleteTodo(ctx: Context) {
    // Get the todo with the id given in the URL if it exists.
    const todo = await getRepository(Todo).findOne({ id: ctx.request.params.id });

    // Return a 404 Not Found response if no such todo exists.
    if (!todo) {
      return new HttpResponseNotFound();
    }

    // Remove the todo from the database.
    await getRepository(Todo).remove(todo);

    // Returns an successful empty response. The status is 204.
    return new HttpResponseNoContent();
  }

}
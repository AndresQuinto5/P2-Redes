/** UNIVERSIDAD DEL VALLE DE GUATEMALA
 *  REDES 1
 *  AndresQuinto
 *  Mirka Monzon
 *  Oscar de Leon
 *  PROYECTO 2 -> RACK-O
 */

/*****************************************************************
 * We've used express to manage the server side using websockets
 * To install the server use the terminal -> path_to_server -> npm install
 * To Run the server use the terminal -> path_to_server -> npm start
 * Some code is extracted and modified from 
 * https://dev.to/ksankar/websockets-with-react-express-part-1-4o68
/****************************************************************/

/* *Library importing */
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

/** Main server-side functions to add, remove & get users, also for the rooms */
const users = [];

const addUser = ({ id, name, playerType, room }) => {
  const numberOfUsersInRoom = users.filter((user) => user.room === room).length;
  if (numberOfUsersInRoom === 4) return { error: "The Room is full" };

  const newUser = { id, name, playerType, room };
  users.push(newUser);
  return { newUser };
};

const removeUser = (id) => {
  const removeIndex = users.findIndex((user) => user.id === id);

  if (removeIndex !== -1) return users.splice(removeIndex, 1)[0];
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};
/**************************************************************** */

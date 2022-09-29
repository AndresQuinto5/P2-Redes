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

/** Server instances */
const PORT = 8000;
const app = express();
const server = http.createServer(app);
const io = socketio(server);

/** Used to validate the cors headers calls */
app.use(cors());

/** Socket calls AKA server IO functions */

io.on("connection", (socket) => {
  /** Manages the calls when a users connects to the server */

  socket.on("join", (payload, callback) => {
    let { room, name } = payload;
    let usersInRoom = getUsersInRoom(payload.room).length;
    const { error, newUser } = addUser({
      id: socket.id,
      name,
      playerType:
        usersInRoom === 0
          ? "Player 1"
          : usersInRoom === 1
          ? "Player 2"
          : usersInRoom === 2
          ? "Player 3"
          : "Player 4",
      room,
    });

    //Desconections or bad request validations
    if (error) return callback(error);

    // Adds user to a room
    socket.join(newUser.room);

    //Returns the room data
    io.to(newUser.room).emit("roomData", {
      room: newUser.room,
      users: getUsersInRoom(newUser.room),
    });

    // Gets and return the current user data
    socket.emit("currentUserData", { playerType: newUser.playerType });
    callback();
  });

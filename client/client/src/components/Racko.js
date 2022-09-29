import React, { useEffect, useState, memo } from "react";
import { useHistory } from "react-router";
import queryString from "query-string";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:8000";
let socket;

const shuffle = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
};


export default memo(Racko);

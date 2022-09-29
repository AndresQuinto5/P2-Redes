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

const isAscending = (arr) => {
  return arr.every(function (x, i) {
    return i === 0 || x >= arr[i - 1];
  });
};

const Racko = (props) => {
  const data = queryString.parse(props.location.search);
  const history = useHistory();
  const [room] = useState(data.roomCode);
  const [roomFull, setRoomFull] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [deck, setDeck] = useState(shuffle([...Array(61).keys()]));
  const [discartedDeck, setDiscartedDeck] = useState([]);

  const [player1Deck, setPlayer1Deck] = useState([]);
  const [player2Deck, setPlayer2Deck] = useState([]);
  const [player3Deck, setPlayer3Deck] = useState([]);
  const [player4Deck, setPlayer4Deck] = useState([]);

  const [gameOver, setGameOver] = useState(false);
  const [turn, setTurn] = useState("");
  const [winner, setWinner] = useState("");

  const [isChatBoxHidden, setChatBoxHidden] = useState(true);
  const [deckPressed, setDeckPressed] = useState(false);
  const [currentDeckCard, setCurrentDeckCard] = useState("");
  const [takeDeckCard, setTakeDeckCard] = useState(false);
  const [deckCardPosition, setDeckCardPosition] = useState(0);

  const toggleChatBox = () => {
    const chatBody = document.querySelector(".chat-body");
    if (isChatBoxHidden) {
      chatBody.style.display = "block";
      setChatBoxHidden(false);
    } else {
      chatBody.style.display = "none";
      setChatBoxHidden(true);
    }
  };

  useEffect(() => {
    const connectionOptions = {
      forceNew: true,
      reconnectionAttempts: "Infinity",
      timeout: 10000,
      transports: ["websocket"],
    };
    socket = io.connect(ENDPOINT, connectionOptions);

    socket.emit("join", { room, name: data.username }, (error) => {
      if (error) setRoomFull(true);
    });

    return () => {
      try {
        //cleanup on component unmount
        socket.emit("disconnect");
        //shut down connnection instance
        socket.off();
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    setDeckPressed(false);
  }, [turn]);

  useEffect(() => {
    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });

    socket.on("currentUserData", ({ playerType }) => {
      setCurrentUser(playerType);
    });
  }, []);

  useEffect(() => {
    socket.emit("initGameState", {
      gameOver: false,
      turn: "Player 1",
      player1Deck: deck.slice(0, 10),
      player2Deck: deck.slice(10, 20),
      player3Deck: deck.slice(20, 30),
      player4Deck: deck.slice(30, 40),
      deck: deck.slice(40, 60),
      discartedDeck: [],
    });
  }, []);

  useEffect(() => {
    socket.on(
      "initGameState",
      ({
        gameOver,
        turn,
        player1Deck,
        player2Deck,
        player3Deck,
        player4Deck,
        deck,
        discartedDeck,
      }) => {
        setGameOver(gameOver);
        setTurn(turn);
        setPlayer1Deck(player1Deck);
        setPlayer2Deck(player2Deck);
        setPlayer3Deck(player3Deck);
        setPlayer4Deck(player4Deck);
        setDeck(deck);
        setDiscartedDeck(discartedDeck);
      }
    );

    socket.on(
      "updateGameState",
      ({
        gameOver,
        winner,
        turn,
        player1Deck,
        player2Deck,
        player3Deck,
        player4Deck,
        deck,
        discartedDeck,
        deckCard,
        deckDisabled,
      }) => {
        gameOver && setGameOver(gameOver);
        winner && setWinner(winner);
        turn && setTurn(turn);
        player1Deck && setPlayer1Deck(player1Deck);
        player2Deck && setPlayer2Deck(player2Deck);
        player3Deck && setPlayer3Deck(player3Deck);
        player4Deck && setPlayer4Deck(player4Deck);

        deck && setDeck(deck);
        discartedDeck && setDiscartedDeck(discartedDeck);
        setCurrentDeckCard(deckCard);
      }
    );

    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);

      const chatBody = document.querySelector(".chat-body");
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", { message: message }, () => {
        setMessage("");
      });
    }
  };

  const handlePressDeck = () => {
    setDeckPressed(true);
    const deckCard = deck[0];

    socket.emit("updateGameState", {
      deckCard,
    });
  };


export default memo(Racko);

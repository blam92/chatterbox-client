// YOUR CODE HERE:
var message = {
  username: 'shawndrost',
  text: '*',
  roomname: '4chan'
};

var stringCleaner = function(string) {
  // if (string === undefined || string === '' || string === null) {
  //   return 'Blank';
  // }

  // var badSymbols = ['*', '"', "'", '<', '>', ':', '/', '.'];
  // var cleanString = string;
  // badSymbols.forEach(function(symbol) {
  //   cleanString = cleanString.replace(symbol, '\\' + symbol);
  // });
  // return cleanString;

  var div = document.createElement('div');
  div.appendChild(document.createTextNode(string));
  return div.innerHTML;
};

class User {
  constructor() {
    this.username = stringCleaner(window.location.search.slice(10));
    this.friends = [];
  }
}

var app = {
  init: function() {
    $(document).ready(function() {
      app.displayMessages();
      var user = new User();

      $('#send-button').on('click', function(event) {
        var inputText = $('#my-message').val(); 
        var username = user.username;
        var room = $('#roomlist option:selected').text();
        console.log(room);
        app.send(username, inputText, room);
      });

      $('body').on('change', '#roomlist', function(event) {
        app.filterMessagesByRoom();
      });
        
      $('#create-room-button').on('click', function(event) {
        var username = user.username;
        var newRoom = stringCleaner($('#new-room').val());
        var welcomeMessage = 'Welcome to my new room :)';
        app.send(username, welcomeMessage, newRoom);
        app.displayMessages(newRoom);
      });
    }); 
  },
  filterMessagesByRoom: function() {
    var currentRoom = $('#roomlist').val();
    console.log(currentRoom);
    $('.chat').hide();
    $(`[data-room=${currentRoom}]`).show();
  },

  displayMessages: function(defaultRoom = undefined) {
    $.get('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages', {order: '-createdAt', limit: '100' }, function(request) {
      var messages = request.results;
      messages.forEach( function(messageObj) {
        var cleanName = stringCleaner(messageObj.username);
        var cleanMessage = stringCleaner(messageObj.text);
        var cleanRoom = stringCleaner(messageObj.roomname);
        var $chat = `<div class="chat" data-room=${cleanRoom}>${cleanName}:  ${cleanMessage} </div>`;
        $('#chats').append($chat);
      });
      var $dropDown = app.createDropDown(messages, defaultRoom);
      $('h1').after($dropDown);
      app.filterMessagesByRoom();

    });  
  },
  createDropDown: function(array, startingRoom = undefined) {
    var $dropDown = $('#roomlist');
    var roomArray = _.pluck(array, 'roomname');
    var uniqRoomArray = _.uniq(roomArray);
    uniqRoomArray.forEach(function(room) {
      var cleanRoom = stringCleaner(room);
      if (startingRoom !== undefined && startingRoom === room) {
        var $startingOption = $(`<option selected value=${cleanRoom}>${cleanRoom}</option>`);
        $dropDown.prepend($startingOption);
      } else {
        var $option = $(`<option value=${cleanRoom}>${cleanRoom}</option>`);
        $dropDown.prepend($option);
      }
    });
    return $dropDown;
  },
  createChatComponent: function() {},

  send: function(username, text, room) {
    var message = {};
    message.username = username;
    message.text = text;
    message.roomname = room;

    $.ajax({
      url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent' + JSON.stringify(message));
        app.displayMessages(message.roomname);
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    }); 
  },
  
  createRoom: function() {
  
  }
};


app.init();





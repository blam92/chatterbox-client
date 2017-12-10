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

var spaceReplacerWithDash = function(string) {
  return string.replace(/\s+/g, '-');
};

class User {
  constructor() {
    this.username = stringCleaner(window.location.search.slice(10));
    this.friends = {};
  }
}

var app = {
  user: undefined,

  init: function() {
    $(document).ready(function() {
      app.displayMessages();

      setInterval(function() {
        app.displayMessages(undefined, '100');
      }, 8000);
      app.user = new User();

      $('#send-button').on('click', function(event) {
        var inputText = $('#my-message').val(); 
        var username = app.user.username;
        var room = $('#roomlist option:selected').text();
        console.log(room);
        app.send(username, inputText, room);
      });

      $('body').on('change', '#roomlist', function(event) {
        app.filterMessagesByRoom();
      });
        
      $('#create-room-button').on('click', function(event) {
        var username = app.user.username;
        var newRoom = stringCleaner($('#new-room').val());
        var welcomeMessage = 'Welcome to my new room :)';
        app.send(username, welcomeMessage, newRoom);
        app.displayMessages(newRoom);
      });

      $('body').on('click', '.chat', function(event) {
        var username = $(this).data().user;
        if (app.user.friends[username] === undefined) {
          app.user.friends[username] = username;
        } else {
          delete app.user.friends[username];
        }
        
        $(`[data-user=${username}]`).toggleClass('friend');
        
      });
    }); 
  },
  filterMessagesByRoom: function() {
    var currentRoom = $('#roomlist').val();
    $('.chat').hide();
    $(`[data-room=${currentRoom}]`).show();
  },

  displayMessages: function(defaultRoom = undefined, limit = '100') {
    app.clearMessages();
    $.get('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages', {order: '-createdAt', limit: limit }, function(request) {
      var messages = request.results;
      messages.forEach( function(messageObj) {
        var cleanName = stringCleaner(messageObj.username);
        var cleanMessage = stringCleaner(messageObj.text);
        var cleanRoom = stringCleaner(messageObj.roomname);
        var userForDataProperty = spaceReplacerWithDash(cleanName);
        var roomForDataProperty = spaceReplacerWithDash(cleanRoom);

        var $chat = `<div class="chat" data-room=${roomForDataProperty} data-user=${userForDataProperty}>
        ${cleanName}:  ${cleanMessage} </div>`;

        $('#chats').append($chat);
        app.addClassIfFriend(userForDataProperty);
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
      var roomForDataProperty = spaceReplacerWithDash(cleanRoom);
      if (startingRoom !== undefined && startingRoom === room) {
        var $startingOption = $(`<option selected value=${roomForDataProperty}>${cleanRoom}</option>`);
        $dropDown.prepend($startingOption);
      } else {
        var $option = $(`<option value=${roomForDataProperty}>${cleanRoom}</option>`);
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
  
  clearMessages: function() {
    $('#chats').empty();
  },

  addClassIfFriend: function(username) {
    if (app.user.friends[username] !== undefined) {
      $(`[data-user=${username}]`).addClass('friend');
    }
  }
};


app.init();





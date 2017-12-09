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


var app = {
  init: function() {
    $(document).ready(function() {
      app.displayMessages();
      $('#send-button').on('click', function(event) {
        var inputText = $('#my-message').val(); 
        var username = window.location.search.slice(10);
        var room = $('#roomlist').val();
        app.send(username, inputText, room);
        console.log(inputText, username, room);
      });

      $('body').on('change', '#roomlist', function(event) {
        var currentRoom = $(this).val();
        console.log(currentRoom);
        // var $filteredArray = $('#chats').children(`[data-room=${currentRoom}]`);
        $('.chat').hide();
        // $filteredArray.show('#chats');
        console.log($(`[data-room=${currentRoom}]`));
        $(`[data-room=${currentRoom}]`).show();
      });
        
      
    }); 
  },

  displayMessages: function() {
    $.get('http://parse.sfm6.hackreactor.com/chatterbox/classes/messages?limit=2000', function(request) {
      var messages = request.results;
      messages.forEach( function(messageObj) {
        var cleanName = stringCleaner(messageObj.username);
        var cleanMessage = stringCleaner(messageObj.text);
        var cleanRoom = stringCleaner(messageObj.roomname);
        var $chat = `<div class="chat" data-room=${cleanRoom}>${cleanName}:  ${cleanMessage} </div>`;
        $('#chats').prepend($chat);
      });
      var $dropDown = app.createDropDown(messages);
      $('h1').after($dropDown);

    });  
  },
  createDropDown: function(array) {
    var $dropDown = $('<select id="roomlist" name="rooms"></select>');
    var roomArray = _.pluck(array, 'roomname');
    var uniqRoomArray = _.uniq(roomArray);
    uniqRoomArray.forEach(function(room) {
      var cleanRoom = stringCleaner(room);
      var $option = $(`<option value=${cleanRoom}>${cleanRoom}</option>`);
      $dropDown.append($option);
    });
    return $dropDown;
  },
  createChatComponent: function() {},

  send: function(username, text, room) {
    var message = {};
    message.username = username;
    message.text = text;
    message.room = room;
    $.ajax({
      url: 'http://parse.sfm6.hackreactor.com/chatterbox/classes/messages',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
      },
      error: function (data) {
        console.error('chatterbox: Failed to send message', data);
      }
    }); 
  }
};


app.init();





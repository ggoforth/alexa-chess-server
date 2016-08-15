(function () {
  var board,
    game = new Chess(),
    statusEl = $('#status'),
    fenEl = $('#fen'),
    pgnEl = $('#pgn');

  var updateStatus = function () {
    var status = '';

    var moveColor = 'White';
    if (game.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (game.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (game.in_draw() === true) {
      status = 'Game over, drawn position';
    }

    // game still on
    else {
      status = moveColor + ' to move';

      // check?
      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    statusEl.html(status);
    fenEl.html(game.fen());
    pgnEl.html(game.pgn());
  };

  var cfg = {
    draggable: true,
    position: 'start',
    pieceTheme: 'js/chessboardjs/www/img/chesspieces/alpha/{piece}.png'
  };
  
  board = ChessBoard('board', cfg);

  updateStatus();

  var socket = io.connect('http://chess.shift3sandbox.com:8080');

  socket.on('move piece', function (data) {
    console.log('Moving piece: ', data);

    var move = game.move({
      from: data.from,
      to: data.to,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (!move) return;

    board.move(data.from + '-' + data.to);
    updateStatus();
  });
}());

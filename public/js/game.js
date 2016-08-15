(function () {
  /**
   * The board object, will be set near the end of the script.
   */
  var board,

    /**
     * The game validation engine.
     */
    game = new Chess(),

    /**
     * The status of the game, IE whos turn it is.
     * 
     * @type {*|jQuery|HTMLElement}
     */
    statusEl = $('#status'),

    /**
     * The fen element.
     * 
     * @type {*|jQuery|HTMLElement}
     */
    fenEl = $('#fen');

  /**
   * The status updating function.
   */
  var updateStatus = function () {
    var status = '';

    var moveColor = 'White';
    
    if (game.turn() === 'b') moveColor = 'Black';
    if (game.in_checkmate() === true) status = 'Game over, ' + moveColor + ' is in checkmate.';
    else if (game.in_draw() === true) status = 'Game over, drawn position';
    else {
      status = moveColor + ' to move';

      if (game.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }
    }

    statusEl.html(status);
    fenEl.html(game.fen());
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

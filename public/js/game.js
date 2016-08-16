(function () {
  /**
   * The game validation engine.
   */
  var game = new Chess(),

    /**
     * Will hold the board instance.
     */
    board,

    /**
     * The status of the game, IE whos turn it is.
     *
     * @type {*|jQuery|HTMLElement}
     */
    statusEl = $('#status'),

    /**
     * The games header bar.
     *
     * @type {*|jQuery|HTMLElement}
     */
    header = $('.game-header'),

    /**
     * The game code to join.
     *
     * @type {*|jQuery|HTMLElement}
     */
    gameCode = $('.game-code'),

    /**
     * The enter game code div.
     *
     * @type {*|jQuery|HTMLElement}
     */
    enterGameCode = $('.enter-game-code'),

    /**
     * The join game button.
     *
     * @type {*|jQuery|HTMLElement}
     */
    joinGame = $('.join-game'),

    /**
     * The chess board containing div.
     *
     * @type {*|jQuery|HTMLElement}
     */
    chessBoard = $('.chess-board'),

    /**
     * Leave a game.
     * 
     * @type {*|jQuery|HTMLElement}
     */
    leaveGame = $('.leave-game'),

    /**
     * The You win message.
     * 
     * @type {*|jQuery|HTMLElement}
     */
    youWinMessage = $('.you-win'),

    /**
     * The status updating function.
     */
    updateStatus = function () {
      var status = '';

      var moveColor = 'White';

      if (game.turn() === 'b') {
        moveColor = 'Black';
      }

      if (game.in_checkmate() === true) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
      } else if (game.in_draw() === true) {
        status = 'Game over, drawn position';
      } else {
        status = moveColor + ' to move';

        if (game.in_check() === true) {
          status += ', ' + moveColor + ' is in check';
        }
      }

      statusEl.html(status);
    },

    /**
     * Move a piece on the board.
     * 
     * @param data
     */
    movePiece = function (data) {
      var move = game.move({
        from: data.from,
        to: data.to,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });

      // illegal move
      if (!move) return;

      //move the piece
      board.move(data.from + '-' + data.to);

      //update the status
      updateStatus();

      //When a piece is moved, we need to store 
      localStorage.setItem('chess.fen', game.fen());
    },

    /**
     * Leave game event.
     */
    leaveGameEvent = function () {
      localStorage.clear();
      window.location.reload(true);
      socket.emit('left game', currentGame); 
    },

    /**
     * Configuration option for the actual board.  The game validation
     * and the board handling mechanics work independently of each
     * other, so this is just the board config.
     *
     * @type {{draggable: boolean, position: string, pieceTheme: string}}
     */
    cfg = {
      draggable: false,
      position: localStorage.getItem('chess.fen') || 'start',
      pieceTheme: 'js/chessboardjs/www/img/chesspieces/alpha/{piece}.png'
    },

    /**
     * When someone leaves the game early.
     */
    youWin = function () {
      header.hide();
      chessBoard.hide();
      enterGameCode.hide();
      youWinMessage.show(); 
    },
    
    /**
     * The socket connection.
     *
     * @type {*|{server}}
     */
    socket = io.connect(),

    /**
     * The current game, if there is one.
     */
    currentGame = localStorage.getItem('chess.room'),

    /**
     * Get the current fen.
     */
    currentFen = localStorage.getItem('chess.fen');

  /**
   * We don't yet have a game setup.
   */
  if (!currentGame) {
    header.hide();
    chessBoard.hide();
    youWinMessage.hide();
    enterGameCode.show();

    /**
     * Listen for clicks on the join game button.
     */
    joinGame.on('click', function () {
      var code = gameCode.val();
      if (!code) return;
      socket.emit('join game', code);
      localStorage.setItem('chess.room', code);
      window.location.reload(true);
    });
  } else {
    //joins the proper game room
    socket.emit('join game', currentGame);
   
    //show and hide all the relevant things
    header.show();
    chessBoard.show();
    enterGameCode.hide();
    youWinMessage.hide();
    
    //setup the leave game button click handler.
    leaveGame.on('click', leaveGameEvent);

    /**
     * If we have a current fen (we've been playing), load it now.
     * This is what sets who's turn it is first.
     */
    if (currentFen) game.load(currentFen);

    
    //Initialize the board on screen.
    board = ChessBoard('board', cfg);

    //When a move piece event is triggered...
    socket.on('move piece', movePiece);
    socket.on('you win', youWin);

    //Update the status of the board.
    updateStatus();
  }
}());

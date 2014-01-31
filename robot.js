
var currentAnimation;

var moves = 0;
var turns = 0;

var room = {

    dim: 10,
    trash: {},
    level: 1,

    create: function(level) {
        this.level = level || 1;
        console.clear();
        this.$el = $('<div class="room"><div class="room-inner"></div></div>')
            .appendTo('body');
        this.drawTiles();
        this.placeRobot();
        this.generateObstacles();
    },

    drawTiles: function() {
        for (var x=0; x<this.dim; x++) {
            var row = $('<div class="room-row"></div>').appendTo(this.$el);
            for (var y=0; y<this.dim; y++) {
                $('<div class="room-tile"></div>').appendTo(row);
            }
        }
    },

    placeRobot: function() {
        robot.el = $('<div class="robot"></div>')
            .animateRotate(90)
            .hide()
            .toTile(0, 9)
            .appendTo(this.$el)
            .fadeIn();
    },

    generateObstacles: function(n) {
        if (this.level == 1) {
            this.addTrash(2, 2);
            this.addTrash(7, 4);
            this.addTrash(8, 9);
        }
        if (this.level == 2) {
            this.addTrash(1, 6);
            this.addTrash(9, 9);
            this.addTrash(2, 1);
            this.addTrash(7, 4);
            this.addXWall(7, [5, 6]);
            this.addYWall(2, [5, 6, 7, 8, 9]);
        }
        if (this.level == 3) {
            this.addTrash(0, 1);
            this.addTrash(9, 4);
            this.addTrash(8, 9);
            this.addTrash(5, 7);
            this.addTrash(2, 2);
            this.addXWall(1, [7, 8]);
            this.addYWall(7, [0, 9]);
            this.addXWall(6, [5, 6, 7, 8]);
            this.addWall(4, 6, 'e');
            this.addWall(2, 5, 'e');
            this.addXWall(4, [0, 1, 7, 8, 9]);
        }
    },

    addTrash: function(x, y) {
        $('<div class="trash"></div>').hide().toTile(x, y).appendTo(this.$el).fadeIn();
    },

    addXWall: function(y, not) {
        for (var x=0; x<10; x++) {
            if (not.indexOf(x) === -1) {
                this.addWall(x, y, 's');
            }
        }
    },

    addYWall: function(x, not) {
        for (var y=0; y<10; y++) {
            if (not.indexOf(y) === -1) {
                this.addWall(x, y, 'e');
            }
        }
    },

    addWall: function(x, y, d) {
        if (d == 'n') {
            this.tileAt(x, y).addClass('wall-n');
            this.tileAt(x, y-1).addClass('wall-s');
        }
        if (d == 'e') {
            this.tileAt(x, y).addClass('wall-e');
            this.tileAt(x+1, y).addClass('wall-w');
        }
        if (d == 's') {
            this.tileAt(x, y).addClass('wall-s');
            this.tileAt(x, y+1).addClass('wall-n');
        }
        if (d == 'w') {
            this.tileAt(x, y).addClass('wall-w');
            this.tileAt(x-1, y).addClass('wall-e');
        }
    },

    tileAt: function(x, y) {
        return $('.room-row:eq(' + y + ') .room-tile:eq(' + x + ')');
    },

    isClean: function() {
        return $('.trash').length === 0;
    }
};

var robot = {

    el: null,
    maxMoves: 1000,

    turnRight: function() {
        turns++;
        this.el.animateRotate(90)
    },

    turnLeft: function() {
        turns++;
        this.el.animateRotate(-90)
    },

    move: function(n) {
        moves++;
        var next = this.getNextMove(n);

        if (next.invalid) {
            this.el.effect({
                effect: 'shake',
                direction: (next.dir == 'l' || next.dir == 'r' ? 'left' : 'up'),
                distance: 3,
                times: 1,
                easing: 'easeInCirc'
            });
        }
        else {
            this.el.toTile(next.x, next.y);
            this.checkClean();
        }
    },

    getNextMove: function(n) {
        var x = this.el.data('x');
        var y = this.el.data('y');
        var dir = this.el.data('dir');

        var fromTile = room.tileAt(x, y);
        var isWall = false;

        if (dir == 'u') {
            y -= n;
            isWall = fromTile.hasClass('wall-' + (n > 0 ? 'n' : 's'));
        }
        if (dir == 'd') {
            y += n;
            isWall = fromTile.hasClass('wall-' + (n > 0 ? 's' : 'n'));
        }
        if (dir == 'l') {
            x -= n;
            isWall = fromTile.hasClass('wall-' + (n > 0 ? 'w' : 'e'));
        }
        if (dir == 'r') {
            x += n;
            isWall = fromTile.hasClass('wall-' + (n > 0 ? 'e' : 'w'));
        }

        var invalid = isWall || (x < 0 || y < 0 || x >= room.dim || y >= room.dim)

        return {x: x, y: y, dir: dir, invalid: invalid};
    },

    checkClean: function() {
        var x = this.el.data('x');
        var y = this.el.data('y');

        var remainingTrash = $('.trash:not(.gone)')
        var remaining = remainingTrash.length;

        var takeOut = remainingTrash.filter(function(i, t) {
            t = $(t);
            return t.data('x') == x && t.data('y') == y;
        }).addClass('gone');
        var tagged = takeOut.length;

        if (takeOut.length) {
            $.when(currentAnimation).done(function() {
                takeOut.fadeOut({
                    complete: function() {
                        takeOut.remove();
                        if (room.isClean()) {
                            $('<div>The room is clean, nice work!' +
                                '<ul><li>Moves: ' + moves + '</li><li>Turns: ' + turns + '</li>' +
                                '<li>Total: ' + (moves + turns) + '</li></ul>' +
                                'Is that the best you can do?</div>')
                                .dialog({
                                    autoOpen: true,
                                    title: 'Level ' + room.level + ' complete! ',
                                    modal: true
                                });
                        }
                    }
                });
            });
        }

        if (remaining == tagged) {
            throw 'OK';
        }
    },

    msgs: [
        "Yes, sir",
        "Right away, sir",
        "Consider it done",
        "Okay",
        "On it",
        "Alright",
        "Your wish is my command"
    ],

    respond: function() {
        return this.msgs[getRandomInt(0, this.msgs.length)];
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function createRoom(n) {
    room.create(n);
}

function backward(n) {
    move(-1 * (n || 1));
    return robot.respond();
}

function forward(n) {
    move(n || 1);
    return robot.respond();
}

function turnRight() {
    robot.turnRight();
    return robot.respond();
}

function turnLeft() {
    robot.turnLeft();
    return robot.respond();
}

function move(n) {
    console.log(n);
    var d = n < 0 ? -1 : 1;
    for (var i=0; i<Math.abs(n); i++) {
        robot.move(d);
    }
    return robot.respond();
}

function spaceAhead() {
    return !robot.getNextMove(1).invalid;
}

function wallAhead() {
    return robot.getNextMove(1).invalid;
}

$.fn.animateRotate = function(angle, complete) {
    var from = this.data('degs') || 0;
    var to = from + angle;
    this.data('degs', to);

    var n = (to % 360);
    if (n < 0) n+=360;

    if (n == 0) {
        this.data('dir', 'u');
    }
    if (n == 180) {
        this.data('dir', 'd');
    }
    if (n == 270) {
        this.data('dir', 'l');
    }
    if (n == 90) {
        this.data('dir', 'r');
    }

//    console.log("Dir: " + this.data('dir') + ", To: " + to + ", N: " + n);

    return this.animate({
        deg: to
    }, {
        step: function( now ){
            $.style(this, 'transform', 'rotate(' + now + 'deg)');
        },
        done: function() {
            complete && complete();
        }
    });
};

$.fn.toTile = function(x, y, complete) {
    this.data('x', x);
    this.data('y', y);
    var coords = room.tileAt(x, y).position();
    var updates = {
        top: coords.top + 4,
        left: coords.left + 4
    };

//    console.log("Queue: " + this.queue().length);

    if (this.queue().length > robot.maxMoves) {
        throw "OK";
    }

    var d = currentAnimation = $.Deferred();
    return this.animate(updates, {
        done: function (){
            d.resolve();
            complete && complete();
        }
    });
};
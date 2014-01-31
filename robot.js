
var currentAnimation;

var room = {

    dim: 10,
    trash: {},

    create: function() {
        this.$el = $('<div class="room"><div class="room-inner"></div></div>')
            .appendTo('body');
        this.drawTiles();
        this.placeRobot();
        this.generateTrash();
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
            .toTile(0, 9)
            .animateRotate(90)
            .appendTo(this.$el);
    },

    generateTrash: function() {
        $('<div class="trash"></div>').toTile(2, 2, null, true).appendTo(this.$el);
        $('<div class="trash"></div>').toTile(7, 4, null, true).appendTo(this.$el);
        $('<div class="trash"></div>').toTile(8, 9, null, true).appendTo(this.$el);
    }
};

var robot = {
    el:null,

    turnRight: function() {
        this.el.animateRotate(90)
    },

    turnLeft: function() {
        this.el.animateRotate(-90)
    },

    move: function(n) {
        var x = this.el.data('x');
        var y = this.el.data('y');
        var dir = this.el.data('dir');

        if (dir == 'u') {
            y -= n;
        }
        if (dir == 'd') {
            y += n;
        }
        if (dir == 'l') {
            x -= n;
        }
        if (dir == 'r') {
            x += n;
        }

        if (x < 0 || y < 0 || x >= room.dim || y >= room.dim) {
            alert("Out of range!");
        }
        else {
            this.el.toTile(x, y);
            this.checkClean();
        }
    },

    checkClean: function() {
        var x = this.el.data('x');
        var y = this.el.data('y');
//        console.log("Trash at " + x + ", " + y + "?");

        var takeOut = $('.trash').filter(function(i, t) {
            t = $(t);
            return t.data('x') == x && t.data('y') == y;
        });
        $.when(currentAnimation).done(function() {
            takeOut.fadeOut();
        });
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
    var d = n < 0 ? -1 : 1;
    for (var i=0; i<Math.abs(n); i++) {
        robot.move(d);
    }
    return robot.respond();
}


$.fn.animateRotate = function(angle, complete) {
    var from = this.data('degs') || 0;
    var to = from + angle;
    this.data('degs', to);

    var n = (to + 360) % 360;
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

$.fn.toTile = function(x, y, complete, noanimate) {
    this.data('x', x);
    this.data('y', y);
    var coords = $('.room-row:eq(' + y + ') .room-tile:eq(' + x + ')').position();
    var updates = {
        top: coords.top + 4,
        left: coords.left + 4
    };

    if (noanimate === true) {
        return this.css(updates);
    }

    var d = currentAnimation = $.Deferred();
    return this.animate(updates, {
        done: function (){
            d.resolve();
            complete && complete();
        }
    });
};
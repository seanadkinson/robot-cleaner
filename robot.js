
$(function() {
    room.create();
});

var robot;
var items = [];

var room = {

    dim: 10,
    size: 36,
    trash: {},

    create: function() {
        this.$el = $('<div class="room"></div>')
            .appendTo('body');
        this.drawTiles();
        this.placeRobot();
        this.generateTrash();
    },

    drawTiles: function() {
        for (var x=0; x<this.dim; x++) {
            var row = $('<div class="room-row"></div>').appendTo(this.$el);
            for (var y=0; y<this.dim; y++) {
                $('<div class="room-tile"></div>')
                    .width(this.size)
                    .height(this.size)
                    .appendTo(row);
            }
        }
    },

    placeRobot: function() {
        robot = $('<img class="robot" src="img/roomba.png"/>')
            .toTile(0, 9)
            .animateRotate(90)
            .appendTo(this.$el);
    },

    generateTrash: function() {
        $('<img class="trash" src="img/trash.png"/>').toTile(2, 2).appendTo(this.$el);
        $('<img class="trash" src="img/trash.png"/>').toTile(7, 4).appendTo(this.$el);
        $('<img class="trash" src="img/trash.png"/>').toTile(8, 9).appendTo(this.$el);
    }


}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function backward() {
    move(-1);
}

function forward() {
    move(1);
}

function move(n) {
    var x = robot.data('x');
    var y = robot.data('y');
    var dir = robot.data('dir');

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
        robot.toTile(x, y);
    }
}

function turnRight() {
    robot.animateRotate(90);
}

function turnLeft() {
    robot.animateRotate(-90);
}


$.fn.animateRotate = function(angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
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

    return this.each(function(i, e) {
        args.step = function(now) {
            $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(this, arguments);
        };

        $({deg: from}).animate({deg: to}, args);
    });
};

$.fn.toTile = function(x, y) {
    this.data('x', x);
    this.data('y', y);
    return this.css('top', 7+y*(room.size+1))
        .css('left', 7+x*(room.size+1));
};
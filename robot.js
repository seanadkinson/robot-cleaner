
$(function() {
    room.create();
});

var queue = []

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
        robot.el = $('<img class="robot" src="img/roomba.png"/>')
            .toTile(0, 9)
            .animateRotate(90)
            .appendTo(this.$el);
    },

    generateTrash: function() {
        $('<img class="trash" src="img/trash.png"/>').toTile(2, 2).appendTo(this.$el);
        $('<img class="trash" src="img/trash.png"/>').toTile(7, 4).appendTo(this.$el);
        $('<img class="trash" src="img/trash.png"/>').toTile(8, 9).appendTo(this.$el);
    }
};

var robot = {
    el:null,

    turnRight: function() {
        this.el.animateRotate(90, runQueue)
    },

    turnLeft: function() {
        this.el.animateRotate(-90, runQueue)
    },

    move: function(n) {
        var x = this.el.data('x');
        var y = this.el.data('y');
        var dir = this.el.data('dir');
//        console.log("Moving " + n + " space from " + x + ", " + y + ", dir: " + dir);

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
            queue.length = 0;
            alert("Out of range!");
        }
        else {
            this.el.toTile(x, y, function() {
                robot.checkClean();
                runQueue();
            });
        }
    },

    checkClean: function() {
        var x = this.el.data('x');
        var y = this.el.data('y');
//        console.log("Anything at " + x + ", " + y + "?");

        $('.trash').each(function(i, t) {
            t = $(t);
            if (t.data('x') == x && t.data('y') == y) {
                t.remove();
            }
        });
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function backward(n) {
    move(-1 * (n || 1));
}

function forward(n) {
    move(n || 1);
}

function turnRight() {
    var kickoff = !queue.length;
    queue.push(function() {
//        console.log("Turning Right");
        robot.turnRight();
    });
    if (kickoff) {
        runQueue();
    }
}

function turnLeft() {
    var kickoff = !queue.length;
    queue.push(function() {
//        console.log("Turning Left");
        robot.turnLeft();
    });
    if (kickoff) {
        runQueue();
    }
}

function move(n) {
    var kickoff = !queue.length;

    var d = n < 0 ? -1 : 1;
    for (var i=0; i<Math.abs(n); i++) {
        queue.push(function() {
//            console.log("Moving: " + d);
            robot.move(d);
        });
    }
    if (kickoff) {
        runQueue();
    }
}


function runQueue() {
    if (queue.length) {
//        console.log("Dequeue: " + queue.length);
        queue.splice(0, 1)[0]();
    }
}


$.fn.animateRotate = function(angle, complete) {
    var from = this.data('degs') || 0;
    var to = from + angle;
    this.data('degs', to);

    return this.animate({
        deg: to
    }, {
        step: function( now ){
            $.style(this, 'transform', 'rotate(' + now + 'deg)');
        },
        done: function() {
//            console.log("Rotate DONE");
            var n = (to + 360) % 360;
            if (n == 0) {
                $(this).data('dir', 'u');
            }
            if (n == 180) {
                $(this).data('dir', 'd');
            }
            if (n == 270) {
                $(this).data('dir', 'l');
            }
            if (n == 90) {
                $(this).data('dir', 'r');
            }
            complete && complete();
        }
    });

//    return this.each(function(i, e) {
//        args.step = function(now) {
//            $.style(e, 'transform', 'rotate(' + now + 'deg)');
//            if (step) return step.apply(this, arguments);
//        };
//
//        $({deg: from}).animate({deg: to}, args);
//    });
};

$.fn.toTile = function(x, y, complete) {
    return this.animate({
        top: 7+y*(room.size+1),
        left: 7+x*(room.size+1)
    }, {
        done: $.proxy(function(x, y) {
//            console.log("Move DONE");
            $(this).data('x', x);
            $(this).data('y', y);
            complete && complete();
        }, this, x, y)
    });
};
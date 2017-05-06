
// find and replace JDA with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function JDA(game) {
    this.player = 1;
    this.radius = 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Justinator";
    this.color = "green";
    this.cooldown = 0;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: 0, y: 0 };
};

JDA.prototype = new Entity();
JDA.prototype.constructor = JDA;















// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of zombies from this.game.zombies
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players

JDA.prototype.selectAction = function () {

    var action = { direction: { x: 0, y: 0 }, throwRock: false, target: null};
	var rockDirection = { x: 0, y: 0};
    var acceleration = 1000000;
    var closest = 1000;
	var closestRealDistance = 1000;
	var closestZombieRealDistance = 1000;
	var closestTwo = 1000;
	var closeZombieCount = 0;
    var target = null;
	var targetTwo = null;
	var closestRock = 1000;
	var entityRock = null;
	var closestZombieToRock = 1000;
	var playerTarget = null;
	var playerDistance = 1000;
    this.visualRadius = 500;

	// For each zombie
    for (var i = 0; i < this.game.zombies.length; i++) {
        var ent = this.game.zombies[i];
		var distReal = distance(ent, this);
        var dist = distReal;
		
		// if distance is greater than 50, factor in zombie's speed.
		if (dist > 75) dist = dist / ent.maxSpeed * maxSpeed;
		
		
        if (dist < closest || distReal < 40) {
			closest = dist;
			closestRealDistance = distReal;
            target = ent;
		}
		
		if (distReal < closestZombieRealDistance) closestZombieRealDistance = distReal;
		
		if (distReal < 250) closeZombieCount++;
		
		// if zombie is within visual radius
        if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
			
			var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
			
			if (closeZombieCount < 6 && (this.rocks == 2 || (this.rocks == 1 && targetTwo == null)) && this.cooldown == 0) {
				action.direction.x += difX * acceleration / (distReal * dist);
                action.direction.y += difY * acceleration / (distReal * dist);
				//console.log("hunter on");
			} else {
				action.direction.x -= (difX) * acceleration / (distReal * dist);
                action.direction.y -= (difY) * acceleration / (distReal * dist);
				//console.log("hunter off");
			}
        }
    }
	
	
	
	// factor in repulsion for edges
	action.direction.x -= this.getEdgeWeights(acceleration, this.x, 0, this.game.surfaceWidth);
	action.direction.y -= this.getEdgeWeights(acceleration, this.y, 0, this.game.surfaceHeight);
		
	
	for (var i = 0; i < this.game.players.length; i++) {
		var ent = this.game.players[i];
		var dist = distance(ent, this);
        if (ent.rocks == 0 && dist < playerDistance) {
   		   playerDistance = dist;
		   playerTarget = ent;
		}
	}
	
	
    for (var i = 0; i < this.game.rocks.length; i++) {
        var ent = this.game.rocks[i];
        if (!ent.removeFromWorld && !ent.thrown && this.rocks < 2 && this.collide({ x: ent.x, y: ent.y, radius: (this.visualRadius) })) {
		//if (!ent.removeFromWorld && this.rocks < 2 && this.collide({ x: ent.x, y: ent.y, radius: (this.visualRadius) })) {
            var dist = distance(this, ent);
            if (dist < closestRock && (closestZombieRealDistance - (this.radius * 3) > dist)) {
			    closestRock = dist;
				entityRock = ent;
		    }
			
            if (dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                rockDirection.x += difX * acceleration / (dist * dist);
                rockDirection.y += difY * acceleration / (dist * dist);
            }
        }
    }
	
	// if there is a possible target, find the closest zombie to the target.
	if (target) {
		for (var i = 0; i < this.game.zombies.length; i++) {
		    var ent = this.game.zombies[i];
		    var dist = distance(ent, target);
		   
		   // if distance is greater than 50, factor in zombie's speed.
		    if (dist > 50) dist = dist / ent.maxSpeed * maxSpeed / 2;
		   
		    if (dist < closestTwo) {
			   closestTwo = dist;
			   targetTwo = ent;
		    }
		   
		    if (entityRock) {
			    dist = distance(ent, entityRock);
			    // if distance is greater than 75, factor in zombie's speed.
		        if (dist > 75) dist = dist / ent.maxSpeed * maxSpeed / 2;
		        if (dist < closestZombieToRock) closestZombieToRock = dist;
			}
		   
		}
	}
	
	// if we are closer to a rock than a zombie is to me AND
	// if we are closer to a rock than a zombie is to the rock AND
	// we don't have two rocks already.
	if ((closestZombieToRock - (this.radius * 5) > closestRock ) && this.rocks != 2) {
		action.direction.x = rockDirection.x;
		action.direction.y = rockDirection.y;
		//console.log("YOLO");
	} else if (closestZombieRealDistance > 40) {
		action.direction.x += rockDirection.x;
		action.direction.y += rockDirection.y;
		//console.log("Normal");
	}
	

    if (target && closestRealDistance < 150 && ( closest < closestTwo - (this.radius*2) || this.rocks > 1 )  ) {
        action.target = target; //this.predictPosition(target);
        action.throwRock = true;
		//console.log("long shot");
	} else if (target == null && this.rocks > 1 && playerTarget && playerDistance < 85 ) {
		action.target = playerTarget;
		action.throwRock = true;
		//console.log("shared!!!!");
    } else if (target && closestRealDistance < 45 + (this.radius * 2)) {
		// desperate throw
		action.target = target;
		action.throwRock = true;
	}
    return action;
};


JDA.prototype.getEdgeWeights = function (accel, position, startEdge, endEdge) {
	var dist = Math.abs(startEdge - position);
	var dif = (startEdge - position) / dist;
	var direction = dif * accel / (dist * dist * dist);
	
	dist = Math.abs(endEdge - position);
	dif = (endEdge - position) / dist;
	direction += dif * accel / (dist * dist * dist);
	
	return direction;
}


// no longer using, zombies curve too much making them unpredictable without
// using too much cpu time.
/*
JDA.prototype.predictPosition = function (target) {
	var distDelta = distance(target, this) / this.game.rocks[0].maxSpeed;
	var targetPrediction = { x: target.x, y: target.y };
	targetPrediction.x += target.velocity.x * distDelta;
	targetPrediction.y += target.velocity.y  * distDelta;
	
	return targetPrediction;
}
*/
















// do not change code beyond this point

JDA.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

JDA.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

JDA.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

JDA.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

JDA.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

JDA.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    //if (this.cooldown > 0) console.log(this.action);
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Zombie" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.thrower = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

JDA.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};
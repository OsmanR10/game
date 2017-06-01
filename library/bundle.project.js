require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Game":[function(require,module,exports){
"use strict";
cc._RF.push(module, '05dc84/u7BB7pyB/Ro2ZePE', 'Game');
// scripts\Game.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        //this property quotes the PreFab resource os stars
        starPrefab: {
            default: null,
            type: cc.Prefab
        },

        //the random scale of disappearing time for stars
        maxStarDuration: 0,
        minStarDuration: 0,

        //ground node for confirming the height of the generated star's position
        ground: {
            default: null,
            type: cc.Node
        },

        //player node for obtaining the jump height of the main character and 
        //controlling the movement switch of the main character
        player: {
            default: null,
            type: cc.Node
        },

        //quotation of score label
        scoreDisplay: {
            default: null,
            type: cc.Label
        },

        //scoring sound effect
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    // use this for initialization
    onLoad: function onLoad() {
        //obtain the anchor point of ground level on the y axis
        this.groundY = this.ground.y + this.ground.height / 2;
        //initialize timer
        this.timer = 0;
        this.starDuration = 0;
        //generate a new star
        this.spawnNewStar();
        //initialize scoring
        this.score = 0;
    },

    spawnNewStar: function spawnNewStar() {
        //generate a new node in the scene with a preset template
        var newStar = cc.instantiate(this.starPrefab);
        //put the newly added node under the Canvas node
        this.node.addChild(newStar);
        //set up a random position for the star
        newStar.setPosition(this.getNewStarPosition());

        // deliver the concrete example of the Game component into the star component
        newStar.getComponent('Star').game = this;

        //reset timer, randomly choose a value according to the scale of
        //star duration
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },

    getNewStarPosition: function getNewStarPosition() {
        var randX = 0;
        //accprding to the position of the ground level and the main character's jump
        //height, randomly obtain an anchor point of the star on the y axis
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        //according to the width of the screen, randomly obtain an anchor point of
        //star on the x axis
        var maxX = this.node.width / 2;
        randX = cc.randomMinus1To1() * maxX;
        //return to the anchor point of the star
        return cc.p(randX, randY);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        //update timer for each frame, when a new star is not generated
        //after exceding duration
        //invoke the logic of a game failure
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },

    gainScore: function gainScore() {
        this.score += 1;
        //update the words of the scoreDisplay Label
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        //play the scoring sound effect
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },

    gameOver: function gameOver() {
        this.player.stopAllActions(); //stop the jumping action of the player node
        cc.director.loadScene('game');
    }
});

cc._RF.pop();
},{}],"Player":[function(require,module,exports){
"use strict";
cc._RF.push(module, 'f5cccqJkmxIX6mXIOGOtTI6', 'Player');
// scripts\Player.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        //main character's jump height
        jumpHeight: 0,
        //main character's jump duration
        jumpDuration: 0,
        //maximal movement speed
        maxMoveSpeed: 0,
        //acceleration
        accel: 0,
        //jumping sound effect resource
        jumpAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    setJumpAction: function setJumpAction() {
        //jump up
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        //jump down
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        //repeat
        //callback function to invoke other defined methods after
        //the action is finishd
        var callback = cc.callFunc(this.playJumpSound, this);
        //repeat unceasingly, and invoke callback to play sound after landing each time
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },

    playJumpSound: function playJumpSound() {
        //invoke sound engine to play sound
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },

    setInputControl: function setInputControl() {
        var self = this;
        //add keyboard event listener
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            //When there is a key being presseddown, judge if it's the designated directional button
            //and set up acceleration in the corresponding direction
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },

    // use this for initialization
    onLoad: function onLoad() {
        //initialize jump action
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        //switch of acceleration direction
        this.accLeft = false;
        this.accRight = false;
        //current horizontal speed of main character
        this.xSpeed = 0;

        //initialize keyboard input listener
        this.setInputControl();
    },

    // called every frame
    update: function update(dt) {
        //update speed of each frame according to the current acceleration direction
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        //restrict the movement speed of the main character to the maximum
        //movement speed
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            //if speed reaches its limit, use the max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        //update the position of the main character according to the surrent speed
        this.node.x += this.xSpeed * dt;
    }
});

cc._RF.pop();
},{}],"Star":[function(require,module,exports){
"use strict";
cc._RF.push(module, '344841Je7lBmrN0d8Dx0nl6', 'Star');
// scripts\Star.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        //When the distance between the star and main character is less than this value,
        //collection os the point will be completed
        pickRadius: 0
    },

    // use this for initialization
    onLoad: function onLoad() {},

    getPlayerDistance: function getPlayerDistance() {
        //judge the distance according to the position of the player node
        var playerPos = this.game.player.getPosition();
        //calculate the distance between two nodes according to their positions
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function onPicked() {
        //when the starts are being collected, invoke the interface in the game
        //script to generate a new star
        this.game.spawnNewStar();
        //invoke the scoring method of the Game script
        this.game.gainScore();
        //then destroy the surrent star's node
        this.node.destroy();
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        //judge is the distance between the star and main character is shoter
        //then the collecting distance for each frame
        if (this.getPlayerDistance() < this.pickRadius) {
            //invoke collecting behavior
            this.onPicked();
            return;
        }

        //update the transparency of the star according to the timer int the
        //Game script
        var opacityRation = 1 - this.game.timer / this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRation * (255 - minOpacity));
    }
});

cc._RF.pop();
},{}]},{},["Game","Player","Star"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHRzL0dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9QbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9TdGFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUNJO0FBQ0E7QUFGTzs7QUFLWDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNJO0FBQ0E7QUFGRzs7QUFLUDtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBRkc7O0FBS1A7QUFDQTtBQUNJO0FBQ0E7QUFGVTs7QUFLZDtBQUNBO0FBQ0k7QUFDQTtBQUZPO0FBL0JIOztBQXFDWjtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBQ0g7QUFDRDtBQUNIOztBQUVEO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0k7QUFDQTtBQUNIO0FBMUdJOzs7Ozs7Ozs7O0FDQVQ7QUFDSTs7QUFFQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUZNO0FBVkY7O0FBZ0JaO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNJO0FBQ0E7QUFDSDs7QUFFRDtBQUNJO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFDQTtBQUNKO0FBQ0k7QUFDQTtBQUNBO0FBUlI7QUFVSDtBQUNEO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFDSjtBQUNJO0FBQ0E7QUFOUjtBQVFIO0FBekJ1QjtBQTJCL0I7O0FBRUQ7QUFDQTtBQUNJO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDSDs7QUFFRDtBQUNBO0FBQ0k7QUFDQTtBQUNJO0FBQ0g7QUFDRztBQUNIO0FBQ0Q7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUNIOztBQUVEO0FBQ0E7QUFDSDtBQXRHSTs7Ozs7Ozs7OztBQ0FUO0FBQ0k7O0FBRUE7QUFDSTtBQUNBO0FBQ0E7QUFIUTs7QUFNWjtBQUNBOztBQUlBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNIOztBQUVEO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNIO0FBL0NJIiwic291cmNlc0NvbnRlbnQiOlsiY2MuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvL3RoaXMgcHJvcGVydHkgcXVvdGVzIHRoZSBQcmVGYWIgcmVzb3VyY2Ugb3Mgc3RhcnNcclxuICAgICAgICBzdGFyUHJlZmFiOntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogY2MuUHJlZmFiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcclxuICAgICAgICAvL3RoZSByYW5kb20gc2NhbGUgb2YgZGlzYXBwZWFyaW5nIHRpbWUgZm9yIHN0YXJzXHJcbiAgICAgICAgbWF4U3RhckR1cmF0aW9uOiAwLFxyXG4gICAgICAgIG1pblN0YXJEdXJhdGlvbjogMCxcclxuICAgICAgICBcclxuICAgICAgICAvL2dyb3VuZCBub2RlIGZvciBjb25maXJtaW5nIHRoZSBoZWlnaHQgb2YgdGhlIGdlbmVyYXRlZCBzdGFyJ3MgcG9zaXRpb25cclxuICAgICAgICBncm91bmQ6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBjYy5Ob2RlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcclxuICAgICAgICAvL3BsYXllciBub2RlIGZvciBvYnRhaW5pbmcgdGhlIGp1bXAgaGVpZ2h0IG9mIHRoZSBtYWluIGNoYXJhY3RlciBhbmQgXHJcbiAgICAgICAgLy9jb250cm9sbGluZyB0aGUgbW92ZW1lbnQgc3dpdGNoIG9mIHRoZSBtYWluIGNoYXJhY3RlclxyXG4gICAgICAgIHBsYXllcjp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLk5vZGVcclxuICAgICAgICB9LFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vcXVvdGF0aW9uIG9mIHNjb3JlIGxhYmVsXHJcbiAgICAgICAgc2NvcmVEaXNwbGF5OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IGNjLkxhYmVsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcclxuICAgICAgICAvL3Njb3Jpbmcgc291bmQgZWZmZWN0XHJcbiAgICAgICAgc2NvcmVBdWRpbzp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHVybDpjYy5BdWRpb0NsaXBcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy9vYnRhaW4gdGhlIGFuY2hvciBwb2ludCBvZiBncm91bmQgbGV2ZWwgb24gdGhlIHkgYXhpc1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kWSA9IHRoaXMuZ3JvdW5kLnkgKyB0aGlzLmdyb3VuZC5oZWlnaHQvMjtcclxuICAgICAgICAvL2luaXRpYWxpemUgdGltZXJcclxuICAgICAgICB0aGlzLnRpbWVyID0gMDtcclxuICAgICAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XHJcbiAgICAgICAgLy9nZW5lcmF0ZSBhIG5ldyBzdGFyXHJcbiAgICAgICAgdGhpcy5zcGF3bk5ld1N0YXIoKTtcclxuICAgICAgICAvL2luaXRpYWxpemUgc2NvcmluZ1xyXG4gICAgICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgc3Bhd25OZXdTdGFyOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIC8vZ2VuZXJhdGUgYSBuZXcgbm9kZSBpbiB0aGUgc2NlbmUgd2l0aCBhIHByZXNldCB0ZW1wbGF0ZVxyXG4gICAgICAgIHZhciBuZXdTdGFyID0gY2MuaW5zdGFudGlhdGUodGhpcy5zdGFyUHJlZmFiKTtcclxuICAgICAgICAvL3B1dCB0aGUgbmV3bHkgYWRkZWQgbm9kZSB1bmRlciB0aGUgQ2FudmFzIG5vZGVcclxuICAgICAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobmV3U3Rhcik7XHJcbiAgICAgICAgLy9zZXQgdXAgYSByYW5kb20gcG9zaXRpb24gZm9yIHRoZSBzdGFyXHJcbiAgICAgICAgbmV3U3Rhci5zZXRQb3NpdGlvbih0aGlzLmdldE5ld1N0YXJQb3NpdGlvbigpKTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBkZWxpdmVyIHRoZSBjb25jcmV0ZSBleGFtcGxlIG9mIHRoZSBHYW1lIGNvbXBvbmVudCBpbnRvIHRoZSBzdGFyIGNvbXBvbmVudFxyXG4gICAgICAgIG5ld1N0YXIuZ2V0Q29tcG9uZW50KCdTdGFyJykuZ2FtZSA9IHRoaXM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9yZXNldCB0aW1lciwgcmFuZG9tbHkgY2hvb3NlIGEgdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSBzY2FsZSBvZlxyXG4gICAgICAgIC8vc3RhciBkdXJhdGlvblxyXG4gICAgICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy50aW1lciA9IDA7XHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICBnZXROZXdTdGFyUG9zaXRpb246IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgdmFyIHJhbmRYID0gMDtcclxuICAgICAgICAvL2FjY3ByZGluZyB0byB0aGUgcG9zaXRpb24gb2YgdGhlIGdyb3VuZCBsZXZlbCBhbmQgdGhlIG1haW4gY2hhcmFjdGVyJ3MganVtcFxyXG4gICAgICAgIC8vaGVpZ2h0LCByYW5kb21seSBvYnRhaW4gYW4gYW5jaG9yIHBvaW50IG9mIHRoZSBzdGFyIG9uIHRoZSB5IGF4aXNcclxuICAgICAgICB2YXIgcmFuZFkgPSB0aGlzLmdyb3VuZFkgKyBjYy5yYW5kb20wVG8xKCkgKiB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1BsYXllcicpLmp1bXBIZWlnaHQgKyA1MDtcclxuICAgICAgICAvL2FjY29yZGluZyB0byB0aGUgd2lkdGggb2YgdGhlIHNjcmVlbiwgcmFuZG9tbHkgb2J0YWluIGFuIGFuY2hvciBwb2ludCBvZlxyXG4gICAgICAgIC8vc3RhciBvbiB0aGUgeCBheGlzXHJcbiAgICAgICAgdmFyIG1heFggPSB0aGlzLm5vZGUud2lkdGgvMjtcclxuICAgICAgICByYW5kWCA9IGNjLnJhbmRvbU1pbnVzMVRvMSgpICogbWF4WDtcclxuICAgICAgICAvL3JldHVybiB0byB0aGUgYW5jaG9yIHBvaW50IG9mIHRoZSBzdGFyXHJcbiAgICAgICAgcmV0dXJuIGNjLnAocmFuZFgsIHJhbmRZKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgLy91cGRhdGUgdGltZXIgZm9yIGVhY2ggZnJhbWUsIHdoZW4gYSBuZXcgc3RhciBpcyBub3QgZ2VuZXJhdGVkXHJcbiAgICAgICAgLy9hZnRlciBleGNlZGluZyBkdXJhdGlvblxyXG4gICAgICAgIC8vaW52b2tlIHRoZSBsb2dpYyBvZiBhIGdhbWUgZmFpbHVyZVxyXG4gICAgICAgIGlmKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbil7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRpbWVyICs9IGR0O1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZ2FpblNjb3JlOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMuc2NvcmUgKz0gMTtcclxuICAgICAgICAvL3VwZGF0ZSB0aGUgd29yZHMgb2YgdGhlIHNjb3JlRGlzcGxheSBMYWJlbFxyXG4gICAgICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcclxuICAgICAgICAvL3BsYXkgdGhlIHNjb3Jpbmcgc291bmQgZWZmZWN0XHJcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVkaW8sIGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIGdhbWVPdmVyOiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHRoaXMucGxheWVyLnN0b3BBbGxBY3Rpb25zKCk7IC8vc3RvcCB0aGUganVtcGluZyBhY3Rpb24gb2YgdGhlIHBsYXllciBub2RlXHJcbiAgICAgICAgY2MuZGlyZWN0b3IubG9hZFNjZW5lKCdnYW1lJyk7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCJjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vbWFpbiBjaGFyYWN0ZXIncyBqdW1wIGhlaWdodFxyXG4gICAgICAgIGp1bXBIZWlnaHQ6IDAsXHJcbiAgICAgICAgLy9tYWluIGNoYXJhY3RlcidzIGp1bXAgZHVyYXRpb25cclxuICAgICAgICBqdW1wRHVyYXRpb246IDAsXHJcbiAgICAgICAgLy9tYXhpbWFsIG1vdmVtZW50IHNwZWVkXHJcbiAgICAgICAgbWF4TW92ZVNwZWVkOiAwLFxyXG4gICAgICAgIC8vYWNjZWxlcmF0aW9uXHJcbiAgICAgICAgYWNjZWw6IDAsXHJcbiAgICAgICAgLy9qdW1waW5nIHNvdW5kIGVmZmVjdCByZXNvdXJjZVxyXG4gICAgICAgIGp1bXBBdWRpbzp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBcclxuICAgIHNldEp1bXBBY3Rpb246IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy9qdW1wIHVwXHJcbiAgICAgICAgdmFyIGp1bXBVcCA9IGNjLm1vdmVCeSh0aGlzLmp1bXBEdXJhdGlvbiwgY2MucCgwLHRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XHJcbiAgICAgICAgLy9qdW1wIGRvd25cclxuICAgICAgICB2YXIganVtcERvd24gPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwtdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbkluKCkpO1xyXG4gICAgICAgIC8vcmVwZWF0XHJcbiAgICAgICAgLy9jYWxsYmFjayBmdW5jdGlvbiB0byBpbnZva2Ugb3RoZXIgZGVmaW5lZCBtZXRob2RzIGFmdGVyXHJcbiAgICAgICAgLy90aGUgYWN0aW9uIGlzIGZpbmlzaGRcclxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYy5jYWxsRnVuYyh0aGlzLnBsYXlKdW1wU291bmQsIHRoaXMpO1xyXG4gICAgICAgIC8vcmVwZWF0IHVuY2Vhc2luZ2x5LCBhbmQgaW52b2tlIGNhbGxiYWNrIHRvIHBsYXkgc291bmQgYWZ0ZXIgbGFuZGluZyBlYWNoIHRpbWVcclxuICAgICAgICByZXR1cm4gY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duLCBjYWxsYmFjaykpO1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24oKXtcclxuICAgICAgICAvL2ludm9rZSBzb3VuZCBlbmdpbmUgdG8gcGxheSBzb3VuZFxyXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sIGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBcclxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24oKXtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgLy9hZGQga2V5Ym9hcmQgZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xyXG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5LRVlCT0FSRCxcclxuICAgICAgICAgICAgLy9XaGVuIHRoZXJlIGlzIGEga2V5IGJlaW5nIHByZXNzZWRkb3duLCBqdWRnZSBpZiBpdCdzIHRoZSBkZXNpZ25hdGVkIGRpcmVjdGlvbmFsIGJ1dHRvblxyXG4gICAgICAgICAgICAvL2FuZCBzZXQgdXAgYWNjZWxlcmF0aW9uIGluIHRoZSBjb3JyZXNwb25kaW5nIGRpcmVjdGlvblxyXG4gICAgICAgICAgICBvbktleVByZXNzZWQ6IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KXtcclxuICAgICAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uS2V5UmVsZWFzZWQ6IGZ1bmN0aW9uKGtleUNvZGUsIGV2ZW50KXtcclxuICAgICAgICAgICAgICAgIHN3aXRjaChrZXlDb2RlKXtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHNlbGYubm9kZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy9pbml0aWFsaXplIGp1bXAgYWN0aW9uXHJcbiAgICAgICAgdGhpcy5qdW1wQWN0aW9uID0gdGhpcy5zZXRKdW1wQWN0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbih0aGlzLmp1bXBBY3Rpb24pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vc3dpdGNoIG9mIGFjY2VsZXJhdGlvbiBkaXJlY3Rpb25cclxuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgLy9jdXJyZW50IGhvcml6b250YWwgc3BlZWQgb2YgbWFpbiBjaGFyYWN0ZXJcclxuICAgICAgICB0aGlzLnhTcGVlZCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9pbml0aWFsaXplIGtleWJvYXJkIGlucHV0IGxpc3RlbmVyXHJcbiAgICAgICAgdGhpcy5zZXRJbnB1dENvbnRyb2woKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgIC8vdXBkYXRlIHNwZWVkIG9mIGVhY2ggZnJhbWUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGFjY2VsZXJhdGlvbiBkaXJlY3Rpb25cclxuICAgICAgICBpZih0aGlzLmFjY0xlZnQpe1xyXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCAtPSB0aGlzLmFjY2VsICogZHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmKHRoaXMuYWNjUmlnaHQpe1xyXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCArPSB0aGlzLmFjY2VsICogZHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vcmVzdHJpY3QgdGhlIG1vdmVtZW50IHNwZWVkIG9mIHRoZSBtYWluIGNoYXJhY3RlciB0byB0aGUgbWF4aW11bVxyXG4gICAgICAgIC8vbW92ZW1lbnQgc3BlZWRcclxuICAgICAgICBpZihNYXRoLmFicyh0aGlzLnhTcGVlZCkgPiB0aGlzLm1heE1vdmVTcGVlZCl7XHJcbiAgICAgICAgICAgIC8vaWYgc3BlZWQgcmVhY2hlcyBpdHMgbGltaXQsIHVzZSB0aGUgbWF4IHNwZWVkIHdpdGggY3VycmVudCBkaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSB0aGlzLm1heE1vdmVTcGVlZCAqIHRoaXMueFNwZWVkIC8gTWF0aC5hYnModGhpcy54U3BlZWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL3VwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIG1haW4gY2hhcmFjdGVyIGFjY29yZGluZyB0byB0aGUgc3VycmVudCBzcGVlZFxyXG4gICAgICAgIHRoaXMubm9kZS54ICs9IHRoaXMueFNwZWVkICogZHQ7XHJcbiAgICB9LFxyXG59KTtcclxuIiwiY2MuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvL1doZW4gdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHN0YXIgYW5kIG1haW4gY2hhcmFjdGVyIGlzIGxlc3MgdGhhbiB0aGlzIHZhbHVlLFxyXG4gICAgICAgIC8vY29sbGVjdGlvbiBvcyB0aGUgcG9pbnQgd2lsbCBiZSBjb21wbGV0ZWRcclxuICAgICAgICBwaWNrUmFkaXVzOiAwXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy9qdWRnZSB0aGUgZGlzdGFuY2UgYWNjb3JkaW5nIHRvIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWVyIG5vZGVcclxuICAgICAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRQb3NpdGlvbigpO1xyXG4gICAgICAgIC8vY2FsY3VsYXRlIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHR3byBub2RlcyBhY2NvcmRpbmcgdG8gdGhlaXIgcG9zaXRpb25zXHJcbiAgICAgICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xyXG4gICAgICAgIHJldHVybiBkaXN0O1xyXG4gICAgfSxcclxuICAgIFxyXG4gICAgb25QaWNrZWQ6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgLy93aGVuIHRoZSBzdGFydHMgYXJlIGJlaW5nIGNvbGxlY3RlZCwgaW52b2tlIHRoZSBpbnRlcmZhY2UgaW4gdGhlIGdhbWVcclxuICAgICAgICAvL3NjcmlwdCB0byBnZW5lcmF0ZSBhIG5ldyBzdGFyXHJcbiAgICAgICAgdGhpcy5nYW1lLnNwYXduTmV3U3RhcigpO1xyXG4gICAgICAgIC8vaW52b2tlIHRoZSBzY29yaW5nIG1ldGhvZCBvZiB0aGUgR2FtZSBzY3JpcHRcclxuICAgICAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKCk7XHJcbiAgICAgICAgLy90aGVuIGRlc3Ryb3kgdGhlIHN1cnJlbnQgc3RhcidzIG5vZGVcclxuICAgICAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcclxuICAgICAgICAvL2p1ZGdlIGlzIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBzdGFyIGFuZCBtYWluIGNoYXJhY3RlciBpcyBzaG90ZXJcclxuICAgICAgICAvL3RoZW4gdGhlIGNvbGxlY3RpbmcgZGlzdGFuY2UgZm9yIGVhY2ggZnJhbWVcclxuICAgICAgICBpZih0aGlzLmdldFBsYXllckRpc3RhbmNlKCkgPCB0aGlzLnBpY2tSYWRpdXMpe1xyXG4gICAgICAgICAgICAvL2ludm9rZSBjb2xsZWN0aW5nIGJlaGF2aW9yXHJcbiAgICAgICAgICAgIHRoaXMub25QaWNrZWQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvL3VwZGF0ZSB0aGUgdHJhbnNwYXJlbmN5IG9mIHRoZSBzdGFyIGFjY29yZGluZyB0byB0aGUgdGltZXIgaW50IHRoZVxyXG4gICAgICAgIC8vR2FtZSBzY3JpcHRcclxuICAgICAgICB2YXIgb3BhY2l0eVJhdGlvbiA9IDEgLSB0aGlzLmdhbWUudGltZXIvdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcclxuICAgICAgICB2YXIgbWluT3BhY2l0eSA9IDUwO1xyXG4gICAgICAgIHRoaXMubm9kZS5vcGFjaXR5ID0gbWluT3BhY2l0eSArIE1hdGguZmxvb3Iob3BhY2l0eVJhdGlvbiAqICgyNTUgLSBtaW5PcGFjaXR5KSk7XHJcbiAgICB9LFxyXG59KTtcclxuIl0sInNvdXJjZVJvb3QiOiIifQ==
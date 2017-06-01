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
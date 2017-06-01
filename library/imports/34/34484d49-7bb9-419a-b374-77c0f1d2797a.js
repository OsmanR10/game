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
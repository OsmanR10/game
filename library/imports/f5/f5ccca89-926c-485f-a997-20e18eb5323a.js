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
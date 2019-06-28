var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="./GameObjects.ts" />
var Commands;
(function (Commands) {
    Commands[Commands["JUMP"] = 0] = "JUMP";
    Commands[Commands["JUMP_RELEASE"] = 1] = "JUMP_RELEASE";
    Commands[Commands["DUCK"] = 2] = "DUCK";
    Commands[Commands["LEFT"] = 3] = "LEFT";
    Commands[Commands["RIGHT"] = 4] = "RIGHT";
    Commands[Commands["RUN"] = 5] = "RUN";
    Commands[Commands["RUN_RELEASE"] = 6] = "RUN_RELEASE";
})(Commands || (Commands = {}));
var JumpCommand = /** @class */ (function () {
    function JumpCommand() {
        this.execute = function (gameObject) {
            if (!gameObject.isDead())
                gameObject.jump();
        };
    }
    return JumpCommand;
}());
var MinJumpCommand = /** @class */ (function () {
    function MinJumpCommand() {
        this.execute = function (gameObject, jumpPow) {
            if (!gameObject.isDead()) {
                if (!jumpPow)
                    jumpPow = -8;
                if (gameObject.getYVelocity() < jumpPow)
                    gameObject.setYVelocity(jumpPow);
            }
        };
    }
    return MinJumpCommand;
}());
// TODO: 
var MoveLeftCommand = /** @class */ (function () {
    function MoveLeftCommand() {
        this.execute = function (gameObject) {
            if (!gameObject.isDead())
                gameObject.moveLeft();
        };
    }
    return MoveLeftCommand;
}());
// TODO: test
var MoveRightCommand = /** @class */ (function () {
    function MoveRightCommand() {
        this.execute = function (gameObject) {
            if (!gameObject.isDead())
                gameObject.moveRight();
        };
    }
    return MoveRightCommand;
}());
var RunCommand = /** @class */ (function () {
    function RunCommand() {
        this.execute = function (gameObject) {
            if (!gameObject.isDead())
                if (gameObject.getMaxSpeed() != Physics.STANDARD_MAX_RUN_SPEED)
                    gameObject.setMaxSpeed(Physics.STANDARD_MAX_RUN_SPEED);
        };
    }
    return RunCommand;
}());
var WalkCommand = /** @class */ (function () {
    function WalkCommand() {
        this.execute = function (gameObject) {
            if (!gameObject.isDead())
                if (gameObject.getMaxSpeed() != Physics.STANDARD_MAX_SPEED)
                    gameObject.setMaxSpeed(Physics.STANDARD_MAX_SPEED);
        };
    }
    return WalkCommand;
}());
/// <reference path="Commands.ts" />
/// <reference path="Controls.ts" />
/// <reference path="GameObjects.ts" />
var Physics = /** @class */ (function () {
    function Physics() {
    }
    Physics.GRAVITY = .75;
    Physics.MAX_FALL_SPEED = 18;
    Physics.STANDARD_FRICTION = .55;
    Physics.ICE_FRICTION = .065;
    Physics.STANDARD_JUMP_FRICTION_MULTIPLIER = .66;
    Physics.STANDARD_MAX_SPEED = 3;
    Physics.STANDARD_MAX_RUN_SPEED = 6;
    return Physics;
}());
// game will support a single transition type
var Transition = /** @class */ (function () {
    function Transition(gs) {
        this.gs = gs;
        this.reverseFlag = false;
        this.start = new BlackScreen(this.gs.getCanvas().width, this.gs.getCanvas().height);
        this.end = new ClearScreen(this.gs.getCanvas().width, this.gs.getCanvas().height);
        this.transitioning = false;
        this.transitionScreen = this.start;
    }
    Transition.prototype.isTransitioning = function () {
        return this.transitioning;
    };
    Transition.prototype.isHalfwayDone = function () {
        return this.reverseFlag;
    };
    Transition.prototype.transition = function () {
        this.transitioning = true;
        Renderer.render(this.gs, this.transitionScreen);
        if (!this.reverseFlag) {
            if (!this.transitionScreen.isDoneTransitioning())
                this.transitionScreen.transition();
            else {
                this.transitionScreen = this.end;
                this.reverseFlag = true;
            }
        }
        else {
            if (!this.transitionScreen.isDoneTransitioning())
                this.transitionScreen.transition();
            else {
                this.transitionScreen = this.start;
                this.reverseFlag = false;
                this.transitioning = false;
            }
        }
    };
    return Transition;
}());
var GameManagerEvents;
(function (GameManagerEvents) {
    GameManagerEvents[GameManagerEvents["RESTART_LEVEL"] = 0] = "RESTART_LEVEL";
    GameManagerEvents[GameManagerEvents["FADE"] = 1] = "FADE";
})(GameManagerEvents || (GameManagerEvents = {}));
var GameManager = /** @class */ (function () {
    function GameManager() {
        this.titleScreen = true;
    }
    ;
    GameManager.prototype.isTransitioning = function () {
        if (this.trans)
            return this.trans.isTransitioning();
        else
            return false;
    };
    GameManager.prototype.isTransitionHalfwayDone = function () {
        if (this.trans)
            return this.trans.isHalfwayDone();
        else
            return false;
    };
    GameManager.prototype.setTileScreen = function (b) {
        this.titleScreen = b;
    };
    GameManager.prototype.getTitleScreen = function () {
        return this.titleScreen;
    };
    // waits for a signal to continue with the next event
    GameManager.prototype.wait = function (event) {
        this.nextEvent = event;
    };
    GameManager.prototype.setCurrentLevel = function (l) {
        this.level = l;
    };
    GameManager.prototype.setCurrentCamera = function (c) {
        this.camera = c;
    };
    GameManager.prototype.setCurrentGameScreen = function (s) {
        this.gameScreen = s;
    };
    GameManager.prototype.restartLevel = function () {
        if (!this.isTransitioning()) {
            this.trans = new Transition(this.gameScreen);
            this.wait(GameManagerEvents.RESTART_LEVEL);
            this.transition();
        }
    };
    GameManager.prototype.fade = function () {
        if (!this.isTransitioning()) {
            this.trans = new Transition(this.gameScreen);
            this.wait(GameManagerEvents.FADE);
            this.transition();
        }
    };
    GameManager.prototype.transition = function () {
        this.trans.transition();
    };
    GameManager.prototype.restartLevelEvent = function () {
        if (this.level != null && this.camera != null) {
            // let temp: GameObject[] = this.level.getList();
            // for(var obj of temp)
            // {
            //     obj.reset();
            // }
            this.level.reset();
            this.camera.reset();
        }
        else {
            throw Error("GameManager Error: level or camera is null");
        }
    };
    GameManager.prototype.notify = function () {
        this.executeNextEvent();
    };
    GameManager.prototype.executeNextEvent = function () {
        if (this.nextEvent != null) {
            switch (this.nextEvent) {
                case GameManagerEvents.RESTART_LEVEL:
                    this.restartLevelEvent();
                    //this.transition = true;
                    break;
            }
            this.nextEvent = null;
        }
    };
    GameManager.prototype.removeDeadObjects = function (list) {
        if (this.level != null) {
            if (list.length != 0) {
                var levelList = this.level.getList();
                for (var i = list.length - 1; i >= 0; i--) {
                    levelList.splice(list[i], 1);
                }
            }
        }
    };
    GameManager.prototype.getCurrentSprtiteSheet = function () {
        return this.level.getTileMap().getSpriteSheet();
    };
    GameManager.getInstance = function () {
        return this.gameManager;
    };
    GameManager.gameManager = new GameManager();
    return GameManager;
}());
var Renderer = /** @class */ (function () {
    function Renderer() {
    }
    Renderer.render = function (gs, go) {
        if (gs.objectIsInBounds(go) && go.getColor() != null) {
            gs.getContext().fillStyle = go.getColor();
            gs.getContext().fillRect(Math.round(go.getX()), Math.round(go.getY()), go.getWidth(), go.getHeight());
        }
    };
    Renderer.renderList = function (gs, g) {
        for (var _i = 0, g_1 = g; _i < g_1.length; _i++) {
            var go = g_1[_i];
            if (go instanceof Player) {
                if (go.getColor() != null) {
                    var h = go.getHeight();
                    var a = false;
                    for (var i = 0; i < h; i += 4) {
                        if (a == true)
                            gs.getContext().fillStyle = go.getColor();
                        else
                            gs.getContext().fillStyle = "black";
                        gs.getContext().fillRect(Math.round(go.getX()), Math.round(go.getY() + i), go.getWidth(), 4);
                        a = !a;
                    }
                }
                continue;
            }
            if (go instanceof Cagie) {
                Renderer.renderCagie(gs, go);
                continue;
            }
            if (go instanceof Letter) {
                Renderer.renderLetter(gs, go);
                continue;
            }
            if (go instanceof GameObject) {
                if (gs.objectIsInBounds(go)) {
                    if (go.hasTileMap()) {
                        Renderer.renderGameObjectsTiles(gs, go, go.getTileMap());
                    }
                    else if (go.getColor() != null) {
                        gs.getContext().fillStyle = go.getColor();
                        gs.getContext().fillRect(Math.round(go.getX()), Math.round(go.getY()), go.getWidth(), go.getHeight());
                    }
                }
            }
        }
    };
    Renderer.renderLetter = function (gs, go) {
        var ctx = gs.getContext();
        ctx.fillStyle = go.getColor();
        ctx.fillRect(Math.round(go.getX()), Math.round(go.getY()), go.getWidth(), go.getHeight());
        ctx.fillStyle = "black";
        ctx.font = go.getFont();
        ctx.fillText(go.getLetter(), go.getX() + 5, go.getY() + go.getFontSize() - 2);
    };
    Renderer.renderCagie = function (gs, go) {
        var ctx = gs.getContext();
        ctx.fillStyle = go.getColor();
        ctx.fillRect(Math.round(go.getX()), Math.round(go.getY()), go.getWidth(), TileMap.UNIT);
        ctx.fillRect(Math.round(go.getX()), Math.round(go.getY() + go.getHeight() - TileMap.UNIT), go.getWidth(), TileMap.UNIT);
        ctx.fillRect(Math.round(go.getX()), Math.round(go.getY() + TileMap.UNIT), TileMap.UNIT, go.getHeight() - TileMap.UNIT);
        ctx.fillRect(Math.round(go.getX() + go.getWidth() - TileMap.UNIT), Math.round(go.getY() + TileMap.UNIT), TileMap.UNIT, go.getHeight() - TileMap.UNIT);
    };
    Renderer.renderBackground = function (gs, bg) {
        if (bg == [] || bg == null)
            return;
        for (var _i = 0, bg_1 = bg; _i < bg_1.length; _i++) {
            var go = bg_1[_i];
            gs.getContext().drawImage(go.getImage(), Math.round(go.getX()), Math.round(go.getY()));
            if (go.getX() < 1) {
                gs.getContext().drawImage(go.getImage(), Math.round(go.getX() + go.getWidth()), Math.round(go.getY()));
                if (go.getX() < -go.getWidth()) {
                    go.moveXBy(go.getWidth());
                }
            }
            var right = go.getX() + go.getWidth();
            if (right > go.getWidth()) {
                gs.getContext().drawImage(go.getImage(), Math.round(go.getX() - go.getWidth()), Math.round(go.getY()));
                if (go.getX() > go.getWidth()) {
                    go.moveXBy(-go.getWidth());
                }
            }
        }
    };
    Renderer.renderTiles = function (gs, tileMap) {
        var size = tileMap.size();
        var image = tileMap.getSpriteSheet().getImage();
        for (var i = 0; i < size; i++) {
            var currentTileObject = tileMap.getTileByIndex(i);
            var currentTile = currentTileObject.getTile();
            if (currentTile == null)
                continue;
            gs.getContext().drawImage(image, currentTile.getX(), currentTile.getY(), currentTile.getWidth(), currentTile.getHeight(), Math.round(currentTileObject.getX()), Math.round(currentTileObject.getY()), currentTile.getWidth(), currentTile.getHeight());
        }
    };
    Renderer.renderGameObjectsTiles = function (gs, go, tileMap) {
        var size = tileMap.size();
        var image = tileMap.getSpriteSheet().getImage();
        for (var i = 0; i < size; i++) {
            var currentTileObject = tileMap.getTileByIndex(i, go);
            var currentTile = currentTileObject.getTile();
            if (currentTile == null)
                continue;
            gs.getContext().drawImage(image, currentTile.getX(), currentTile.getY(), currentTile.getWidth(), currentTile.getHeight(), Math.round(currentTileObject.getX()), Math.round(currentTileObject.getY()), currentTile.getWidth(), currentTile.getHeight());
        }
    };
    Renderer.renderLevelUI = function (gs, ui) {
        var ctx = gs.getContext();
        ctx.drawImage(ui.getImage(), ui.getX(), ui.getY());
        ctx.globalAlpha = .6;
        Renderer.renderTiles(gs, ui.getLayer1());
        ctx.globalAlpha = 1;
        Renderer.renderTiles(gs, ui.getLayer2());
        ctx.font = ui.getFont();
        ctx.fillStyle = ui.getFontColor();
        var letters = ui.getName();
        var collected = ui.getLettersCollected();
        var temp = "";
        var y = ui.getY() + (ui.getHeight() / 2) + (ui.getFontSize() / 2);
        var x = TileMap.UNIT * 8;
        var letterSpacing = 20;
        for (var i = 0; i < letters.length; i++) {
            temp += letters.charAt(i);
            if (collected[i] == true) {
                var left = x + ctx.measureText(temp).width + (letterSpacing * i);
                ctx.strokeStyle = "black";
                ctx.fillText(letters.charAt(i), left, y);
                ctx.lineWidth = 2;
                ctx.strokeText(letters.charAt(i), left, y);
                ctx.lineWidth = 1;
            }
            else {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "black";
                ctx.strokeText(letters.charAt(i), x + ctx.measureText(temp).width + (letterSpacing * i), y);
                ctx.lineWidth = 1;
            }
        }
    };
    Renderer.renderObservers = function (gs, obs) {
        var temp = null;
        for (var _i = 0, obs_1 = obs; _i < obs_1.length; _i++) {
            var o = obs_1[_i];
            if (o instanceof MessageBox)
                temp = o;
            if (o instanceof LevelUI)
                this.renderLevelUI(gs, o);
        }
        if (temp != null)
            this.renderMessageBox(gs, temp);
    };
    Renderer.renderMessageBox = function (gs, mb) {
        if (mb.hasMessage()) {
            var ctx = gs.getContext();
            ctx.fillStyle = mb.getBodyColor();
            ctx.fillRect(mb.getX(), mb.getY(), mb.getWidth(), this.getMultilineTextHeight(ctx, mb.getMessageToBeWritten(), mb.getTextX(), mb.getTextY(), 18) + mb.getMargin());
            ctx.fillStyle = mb.getTextColor();
            ctx.font = mb.getFont();
            //ctx.fillText(mb.getMessageToBeWritten(), mb.getTextX(), mb.getTextY());
            this.filleMultilineText(ctx, mb.getMessageToBeWritten(), mb.getTextX(), mb.getTextY(), 18);
        }
    };
    Renderer.filleMultilineText = function (context, message, xPos, yPos, lineSpacing) {
        var tempStrings = [];
        var lines = 0;
        if (message.length > 0)
            tempStrings.push("");
        for (var i = 0; i < message.length; i++) {
            var char = message.charAt(i);
            if (char === '\n') {
                lines++;
                tempStrings.push("");
                continue;
            }
            else {
                tempStrings[lines] += char;
            }
        }
        // print all of them
        for (var j = 0; j <= lines; j++) {
            var s = tempStrings[j];
            context.fillText(s, xPos, yPos + (lineSpacing * j));
        }
    };
    Renderer.getMultilineTextHeight = function (context, message, xPos, yPos, lineSpacing) {
        var lines = 1;
        for (var i = 0; i < message.length; i++) {
            var char = message.charAt(i);
            if (char === '\n') {
                lines++;
            }
        }
        return lineSpacing * lines;
    };
    Renderer.renderLevel = function (gs, level) {
        Renderer.renderBackground(gs, level.getBgObjs());
        Renderer.renderTiles(gs, level.getTileMap());
        Renderer.renderList(gs, level.getList());
        Renderer.renderObservers(gs, level.getObservers());
    };
    Renderer.clearGameScreen = function (screen, color) {
        if (color == null)
            screen.getContext().fillStyle = "white";
        else
            screen.getContext().fillStyle = color;
        screen.getContext().fillRect(0, 0, screen.getCanvas().width, screen.getCanvas().height);
    };
    return Renderer;
}());
var GameScreen = /** @class */ (function () {
    function GameScreen(canvasId) {
        this.canvasId = canvasId;
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
    }
    GameScreen.prototype.getCanvas = function () {
        return this.canvas;
    };
    GameScreen.prototype.getContext = function () {
        return this.context;
    };
    GameScreen.prototype.objectIsInBounds = function (g) {
        if ((g.getRight() > -5 && g.getX() < this.getCanvas().width + 5) && (g.getBottom() > -5 && g.getY() < this.getCanvas().height + 5))
            return true;
        else
            return false;
    };
    GameScreen.prototype.shouldUpdate = function (g) {
        var w = this.getCanvas().width;
        var h = this.getCanvas().height;
        if ((g.getRight() > -w * 2 && g.getX() < w * 3) && (g.getBottom() > -h * 2 && g.getY() < h * 3))
            return true;
        else
            return false;
    };
    GameScreen.prototype.update = function () {
        // update all objects
    };
    return GameScreen;
}());
var Camera = /** @class */ (function () {
    function Camera(attachment, width, height) {
        this.attachment = attachment;
        this.width = width;
        this.height = height;
        this.X_OFFSET = this.width / 2;
        this.Y_OFFSET = this.height * .25;
        this.x = 0;
        this.y = 0;
        this.startX = 0;
        this.startY = 0;
    }
    Camera.prototype.update = function (level) {
        //if player goes beyond mid screen...
        var list = level.getList();
        var bgs = level.getBgObjs();
        var tiles = level.getTileMap();
        var xoffset = this.attachment.getRight() - this.X_OFFSET;
        if (this.x > 0) {
            // offSet = this.attachment.getX()-this.LEFT_OFFSET;
            if (xoffset < 0) {
                // move everything forward by offset!
                for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                    var go = list_1[_i];
                    go.movePositionBy(-xoffset, 0);
                }
                for (var _a = 0, bgs_1 = bgs; _a < bgs_1.length; _a++) {
                    var bg = bgs_1[_a];
                    bg.movePositionBy(-xoffset, 0);
                }
                tiles.moveTileMapBy(-xoffset, 0);
                this.x += xoffset;
            }
        }
        if (xoffset > 0) {
            // move everything back by offset!
            for (var _b = 0, list_2 = list; _b < list_2.length; _b++) {
                var go = list_2[_b];
                go.movePositionBy(-xoffset, 0);
            }
            for (var _c = 0, bgs_2 = bgs; _c < bgs_2.length; _c++) {
                var bg = bgs_2[_c];
                bg.movePositionBy(-xoffset, 0);
            }
            tiles.moveTileMapBy(-xoffset, 0);
            this.x += xoffset;
        }
        var yoffset = this.attachment.getY() - this.Y_OFFSET;
        if (this.y < 0) {
            if (yoffset > 0) {
                // move everything down by offset!
                for (var _d = 0, list_3 = list; _d < list_3.length; _d++) {
                    var go = list_3[_d];
                    go.movePositionBy(0, -yoffset);
                }
                for (var _e = 0, bgs_3 = bgs; _e < bgs_3.length; _e++) {
                    var bg = bgs_3[_e];
                    bg.movePositionBy(0, -yoffset);
                }
                tiles.moveTileMapBy(0, -yoffset);
                this.y += yoffset;
            }
        }
        // offSet = this.attachment.getX()-this.LEFT_OFFSET;
        if (yoffset < 0) {
            // move everything forward by offset!
            for (var _f = 0, list_4 = list; _f < list_4.length; _f++) {
                var go = list_4[_f];
                go.movePositionBy(0, -yoffset);
            }
            for (var _g = 0, bgs_4 = bgs; _g < bgs_4.length; _g++) {
                var bg = bgs_4[_g];
                bg.movePositionBy(0, -yoffset);
            }
            tiles.moveTileMapBy(0, -yoffset);
            this.y += yoffset;
        }
    };
    Camera.prototype.reset = function () {
        this.x = this.startX;
        this.y = this.startY;
    };
    return Camera;
}());
var Tile = /** @class */ (function () {
    function Tile(xTilePos, yTilePos, width, height) {
        this.xTilePos = xTilePos;
        this.yTilePos = yTilePos;
        this.width = width;
        this.height = height;
    }
    Tile.prototype.getX = function () {
        return this.xTilePos;
    };
    Tile.prototype.getY = function () {
        return this.yTilePos;
    };
    Tile.prototype.getWidth = function () {
        return this.width;
    };
    Tile.prototype.getHeight = function () {
        return this.height;
    };
    return Tile;
}());
var TileObject = /** @class */ (function () {
    function TileObject(tile, x, y) {
        this.tile = tile;
        this.x = x;
        this.y = y;
    }
    TileObject.prototype.getX = function () {
        return this.x;
    };
    TileObject.prototype.getY = function () {
        return this.y;
    };
    TileObject.prototype.getTile = function () {
        return this.tile;
    };
    TileObject.prototype.movePositionBy = function (x, y) {
        this.x += x;
        this.y += y;
    };
    return TileObject;
}());
var SpriteSheet = /** @class */ (function () {
    function SpriteSheet(tileWidth, tileHeight, src) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.xSpacing = 1;
        this.ySpacing = 1;
        this.loadImagae(src);
    }
    SpriteSheet.prototype.getTile = function (tileNbr) {
        if (tileNbr <= 0)
            return null;
        tileNbr--; // decrease by because 0 considered the empty tile
        var row = (tileNbr) % this.getTilesPerRow();
        var column = Math.floor((tileNbr) / this.getTilesPerRow());
        var xSpacing = row * this.xSpacing;
        var ySpacing = column * this.ySpacing;
        return new Tile(row * this.tileWidth + xSpacing, column * this.tileHeight + ySpacing, this.tileWidth, this.tileHeight);
    };
    SpriteSheet.prototype.getImage = function () {
        return this.image;
    };
    SpriteSheet.prototype.loadImagae = function (src) {
        this.image = new Image();
        this.image.src = src;
    };
    SpriteSheet.prototype.getWidth = function () {
        return this.image.width;
    };
    SpriteSheet.prototype.getHeight = function () {
        return this.image.height;
    };
    SpriteSheet.prototype.getTilesPerRow = function () {
        return this.getWidth() / (this.tileWidth + this.xSpacing);
    };
    SpriteSheet.prototype.getTilesPerColumn = function () {
        return this.getHeight() / (this.tileHeight + this.ySpacing);
    };
    SpriteSheet.prototype.getTileWidth = function () {
        return this.tileWidth;
    };
    SpriteSheet.prototype.getTileHeight = function () {
        return this.tileHeight;
    };
    return SpriteSheet;
}());
var TileMap = /** @class */ (function () {
    function TileMap(x, y, width, height, sheet) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sheet = sheet;
        this.nbrOfRows = Math.floor(width / this.sheet.getTileWidth());
        this.nbrOfColumns = Math.floor(height / this.sheet.getTileHeight());
        this.startX = this.x;
        this.startY = this.y;
    }
    TileMap.prototype.addTiles = function (tiles) {
        this.tiles = tiles;
    };
    TileMap.prototype.getTileByIndex = function (index, go) {
        var xoffset = this.x;
        var yoffset = this.y;
        // i dont like this workaround
        if (go != null) {
            xoffset = go.getX();
            yoffset = go.getY();
        }
        var row = (index) % (this.nbrOfRows);
        var column = Math.floor((index) / this.nbrOfRows);
        return new TileObject(this.sheet.getTile(this.tiles[index]), xoffset + row * this.sheet.getTileWidth(), yoffset + column * this.sheet.getTileHeight());
    };
    TileMap.prototype.moveTileMapBy = function (posX, posY) {
        this.x += posX;
        this.y += posY;
    };
    TileMap.prototype.moveTileMapTo = function (posX, posY) {
        this.x = posX;
        this.y = posY;
    };
    TileMap.prototype.restart = function () {
        this.moveTileMapTo(this.startX, this.startY);
    };
    TileMap.prototype.size = function () {
        return this.tiles.length;
    };
    TileMap.prototype.getSpriteSheet = function () {
        return this.sheet;
    };
    TileMap.prototype.clearTileMap = function () {
        this.tiles = [];
    };
    TileMap.UNIT = 32;
    return TileMap;
}());
var GameEvent;
(function (GameEvent) {
    GameEvent[GameEvent["DISPLAY_MESSAGE"] = 0] = "DISPLAY_MESSAGE";
    GameEvent[GameEvent["PLAYER_HIT"] = 1] = "PLAYER_HIT";
    GameEvent[GameEvent["PLAYER_MOVE"] = 2] = "PLAYER_MOVE";
    GameEvent[GameEvent["PLAYER_DIED"] = 3] = "PLAYER_DIED";
    GameEvent[GameEvent["PLAYER_DUCK"] = 4] = "PLAYER_DUCK";
    GameEvent[GameEvent["LEVEL_RESTART"] = 5] = "LEVEL_RESTART";
    GameEvent[GameEvent["LETTER_COLLECTED"] = 6] = "LETTER_COLLECTED";
    GameEvent[GameEvent["ALL_LETTERS_COLLECTED"] = 7] = "ALL_LETTERS_COLLECTED";
})(GameEvent || (GameEvent = {}));
var Observer = /** @class */ (function () {
    function Observer() {
    }
    return Observer;
}());
var MessageBox = /** @class */ (function (_super) {
    __extends(MessageBox, _super);
    function MessageBox(width, margin) {
        var _this = _super.call(this) || this;
        _this.width = width;
        _this.margin = margin;
        _this.messageBoxQueue = [];
        _this.alpha = 0;
        _this.counter = 0;
        _this.END_COUNT = 60 * 5;
        _this.TRANSITION_COUNT = 60;
        _this.INCREMENT = .9 / _this.TRANSITION_COUNT;
        _this.current = "";
        _this.currentLetter = 0;
        _this.offset = 0;
        _this.xPos = 0;
        _this.yPos = 0;
        _this.textXpos = 0;
        _this.textYpos = 0;
        _this.lineHeight = 0;
        _this.width = _this.width - _this.margin * 2;
        _this.xPos = _this.margin;
        _this.yPos = _this.margin;
        _this.textXpos = _this.xPos * 2;
        _this.textYpos = _this.yPos * 2;
        return _this;
    }
    MessageBox.prototype.getMargin = function () {
        return this.margin;
    };
    MessageBox.prototype.getWidth = function () {
        return this.width;
    };
    MessageBox.prototype.getHeight = function () {
        // calculate box height
        return 50;
    };
    MessageBox.prototype.getTextX = function () {
        return this.textXpos;
    };
    MessageBox.prototype.getTextY = function () {
        return this.textYpos;
    };
    MessageBox.prototype.getX = function () {
        return this.xPos;
    };
    MessageBox.prototype.getY = function () {
        return this.yPos;
    };
    MessageBox.prototype.getFont = function () {
        return MessageBox.FONT;
    };
    MessageBox.prototype.onNotify = function (src, event, message) {
        if (event == GameEvent.DISPLAY_MESSAGE)
            this.createMessage(src, message);
    };
    MessageBox.prototype.createMessage = function (src, message) {
        if (!this.hasMessage()) {
            this.messageBoxQueue.push(message);
        }
        else if (message !== this.messageBoxQueue[this.messageBoxQueue.length - 1]) {
            this.messageBoxQueue.push(message);
        }
    };
    MessageBox.prototype.getBodyColor = function () {
        return "rgba(255, 255, 255, " + this.alpha + ")";
    };
    MessageBox.prototype.getTextColor = function () {
        return "rgba(0, 0, 0, " + this.alpha + ")";
    };
    MessageBox.prototype.getMessageToBeWritten = function () {
        if (this.hasMessage())
            return this.current;
        else
            return null;
    };
    MessageBox.prototype.getCurrentMessage = function () {
        if (this.hasMessage())
            return this.messageBoxQueue[0];
        else
            return null;
    };
    MessageBox.prototype.removeMessage = function () {
        if (this.hasMessage())
            this.messageBoxQueue.splice(0, 1);
    };
    MessageBox.prototype.hasMessage = function () {
        return this.messageBoxQueue.length > 0;
    };
    MessageBox.prototype.update = function () {
        if (this.hasMessage()) {
            this.counter++;
            if (this.counter < this.TRANSITION_COUNT) {
                this.alpha += this.INCREMENT;
            }
            if (this.current !== this.getCurrentMessage()) {
                if (this.counter % 3 == 0)
                    this.current += this.getCurrentMessage().charAt(this.currentLetter++);
                if (this.counter >= this.TRANSITION_COUNT) {
                    this.offset++;
                }
            }
            else if (this.counter > this.END_COUNT - this.TRANSITION_COUNT + this.offset) {
                this.alpha -= this.INCREMENT;
            }
            if (this.counter >= this.END_COUNT + this.offset) {
                this.removeMessage();
                this.counter = 0;
                this.alpha = 0;
                this.current = "";
                this.currentLetter = 0;
                this.offset = 0;
            }
        }
    };
    MessageBox.FONT = "16px Georgia";
    return MessageBox;
}(Observer));
var BackgroundObject = /** @class */ (function () {
    function BackgroundObject(xPos, yPos, src) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.image = new Image();
        this.image.src = src;
        this.startPosX = xPos;
        this.startPosY = yPos;
    }
    BackgroundObject.prototype.getImage = function () {
        return this.image;
    };
    BackgroundObject.prototype.movePositionTo = function (x, y) {
        this.xPos = x;
        this.yPos = y;
    };
    BackgroundObject.prototype.getX = function () {
        return this.xPos;
    };
    BackgroundObject.prototype.getY = function () {
        return this.yPos;
    };
    BackgroundObject.prototype.moveXBy = function (x) {
        this.xPos += x;
    };
    BackgroundObject.prototype.getWidth = function () {
        return this.image.width;
    };
    BackgroundObject.prototype.getHeight = function () {
        return this.image.height;
    };
    BackgroundObject.prototype.reset = function () {
        this.xPos = this.startPosX;
        this.yPos = this.startPosY;
    };
    return BackgroundObject;
}());
var TopBackgroundObject = /** @class */ (function (_super) {
    __extends(TopBackgroundObject, _super);
    function TopBackgroundObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TopBackgroundObject.prototype.movePositionBy = function (x, y) {
        this.xPos += x;
        this.yPos += y;
    };
    return TopBackgroundObject;
}(BackgroundObject));
var MidBackgroundObject = /** @class */ (function (_super) {
    __extends(MidBackgroundObject, _super);
    function MidBackgroundObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MidBackgroundObject.prototype.movePositionBy = function (x, y) {
        this.xPos += x / 2;
        this.yPos += y;
    };
    return MidBackgroundObject;
}(BackgroundObject));
var BackBackgroundObject = /** @class */ (function (_super) {
    __extends(BackBackgroundObject, _super);
    function BackBackgroundObject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BackBackgroundObject.prototype.movePositionBy = function (x, y) {
        this.xPos += x / 4;
        this.yPos += y;
    };
    return BackBackgroundObject;
}(BackgroundObject));
var LevelUI = /** @class */ (function (_super) {
    __extends(LevelUI, _super);
    function LevelUI(playerRef, spritesheetRef) {
        var _this = _super.call(this) || this;
        _this.playerRef = playerRef;
        _this.spritesheetRef = spritesheetRef;
        _this.lives = -1;
        _this.posX = 0;
        _this.posY = 0;
        _this.lettersCollected = [];
        _this.show = true;
        _this.counter = 0;
        _this.layer1 = null;
        _this.layer2 = null;
        _this.layer2Tiles = [];
        _this.ignore = false;
        _this.complete = false;
        _this.FONT_THINKNESS = 900;
        _this.FONT_SIZE = 28;
        _this.FONT = "Georgia";
        _this.FONT_COLOR = "yellow";
        LevelUI.image.src = "imgs/UI_BG.png";
        _this.lives = _this.playerRef.getLives();
        _this.initLettersCollected();
        _this.layer1 = new TileMap(0, 1, TileMap.UNIT * 6, TileMap.UNIT * 2, spritesheetRef);
        _this.layer2 = new TileMap(TileMap.UNIT, TileMap.UNIT / 2, TileMap.UNIT * 4, TileMap.UNIT * 1, spritesheetRef);
        _this.layer1.addTiles([LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE, LevelUI.TEXTURE_TILE]);
        _this.setLayer2Tiles();
        _this.ignore = true;
        return _this;
    }
    LevelUI.prototype.onNotify = function (src, event, message) {
        if (event == GameEvent.PLAYER_MOVE)
            this.hideUI();
        else if (event == GameEvent.PLAYER_DIED)
            this.showUI();
        else if (event == GameEvent.PLAYER_HIT || event == GameEvent.LEVEL_RESTART) {
            this.lives = this.playerRef.getLives();
            this.setLayer2Tiles();
            this.showUI();
        }
        else if (event == GameEvent.PLAYER_DUCK) {
            this.showUI();
        }
        else if (event == GameEvent.LETTER_COLLECTED) {
            this.checkOffLetter(message);
            this.checkIfLettersComplete();
            this.showUI();
        }
    };
    LevelUI.prototype.getFont = function () {
        return this.FONT_THINKNESS + " " + this.FONT_SIZE + "px " + this.FONT;
    };
    LevelUI.prototype.getFontColor = function () {
        return this.FONT_COLOR;
    };
    LevelUI.prototype.getFontSize = function () {
        return this.FONT_SIZE;
    };
    LevelUI.prototype.checkOffLetter = function (l) {
        for (var i = 0; i < LevelUI.letters.length; i++) {
            if (l === LevelUI.letters.charAt(i)) {
                this.lettersCollected[i] = true;
                return;
            }
        }
    };
    LevelUI.prototype.initLettersCollected = function () {
        this.lettersCollected = [];
        for (var i = 0; i < LevelUI.letters.length; i++) {
            this.lettersCollected.push(false);
        }
    };
    LevelUI.prototype.getLettersCollected = function () {
        return this.lettersCollected;
    };
    LevelUI.prototype.getName = function () {
        return LevelUI.letters;
    };
    LevelUI.prototype.setLayer2Tiles = function () {
        this.layer2.clearTileMap();
        this.layer2Tiles = [];
        this.layer2Tiles.push(LevelUI.PLAYER_HEAD_TILE, 0);
        for (var i = 0; i < this.lives; i++)
            this.layer2Tiles.push(LevelUI.HEALTH_TILE);
        this.layer2.addTiles(this.layer2Tiles);
    };
    LevelUI.prototype.getLayer1 = function () {
        return this.layer1;
    };
    LevelUI.prototype.getLayer2 = function () {
        return this.layer2;
    };
    LevelUI.prototype.getImage = function () {
        return LevelUI.image;
    };
    LevelUI.prototype.getWidth = function () {
        return LevelUI.image.width;
    };
    LevelUI.prototype.getHeight = function () {
        return LevelUI.image.height;
    };
    LevelUI.prototype.getX = function () {
        return this.posX;
    };
    LevelUI.prototype.getY = function () {
        return this.posY;
    };
    LevelUI.prototype.showUI = function () {
        this.show = true;
        this.ignore = true;
        this.counter = 0;
    };
    LevelUI.prototype.hideUI = function () {
        if (!this.ignore) {
            this.show = false;
            this.counter = 0;
        }
    };
    LevelUI.prototype.update = function () {
        if (this.show && this.posY <= 0) {
            this.posY += 2;
            this.layer1.moveTileMapBy(0, 2);
            this.layer2.moveTileMapBy(0, 2);
        }
        else if (!this.show && this.posY + this.getHeight() > 0 && !this.ignore) {
            this.posY -= 2;
            this.layer1.moveTileMapBy(0, -2);
            this.layer2.moveTileMapBy(0, -2);
        }
        else {
            this.counter++;
            if (this.counter > 180) {
                this.showUI();
                this.ignore = false;
            }
        }
    };
    LevelUI.prototype.checkIfLettersComplete = function () {
        for (var _i = 0, _a = this.lettersCollected; _i < _a.length; _i++) {
            var b = _a[_i];
            if (!b) {
                this.complete = false;
                return;
            }
        }
        this.complete = true;
    };
    LevelUI.prototype.allLettersCollected = function () {
        return this.complete;
    };
    LevelUI.image = new Image();
    LevelUI.TEXTURE_TILE = 20; // tile number
    LevelUI.PLAYER_HEAD_TILE = 19; // tile number
    LevelUI.HEALTH_TILE = 21; // tile number
    LevelUI.letters = "BERT";
    return LevelUI;
}(Observer));
var Level = /** @class */ (function () {
    function Level(tileMap, camera, bgObjs) {
        this.tileMap = tileMap;
        this.camera = camera;
        this.list = [];
        this.layerCount = [0, 0, 0];
        this.bgObjects = [];
        this.observers = [];
        this.startPos = 0; // beginning x pos of a level
        this.endPos = 1000; // ending x pos of level
        if (bgObjs != null) {
            this.bgObjects = bgObjs;
        }
    }
    Level.prototype.addObserver = function (obs) {
        this.observers.push(obs);
    };
    Level.prototype.getObservers = function () {
        return this.observers;
    };
    Level.prototype.notifyAll = function (event, message) {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var obs = _a[_i];
            obs.onNotify(null, event, message);
        }
    };
    Level.prototype.getLevelUI = function () {
        return this.levelUI;
    };
    Level.prototype.reset = function () {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var g = _a[_i];
            g.reset();
        }
        this.tileMap.restart();
        for (var _b = 0, _c = this.bgObjects; _b < _c.length; _b++) {
            var g = _c[_b];
            g.reset();
        }
        this.notifyAll(GameEvent.LEVEL_RESTART);
    };
    //adds to first layer
    Level.prototype.add = function (g, layer) {
        //this.list.push(g);
        if (layer == null)
            layer = 2; // layer 3
        if (g instanceof Player) {
            this.playerRef = g;
            this.levelUI = new LevelUI(this.playerRef, this.tileMap.getSpriteSheet());
            this.addObserver(this.levelUI);
            this.playerRef.addObserver(this.levelUI);
        }
        // only 3 layers
        if (layer < 0)
            layer = 0;
        else if (layer > 2)
            layer = 2;
        // if nothing is in the list
        if (this.list == []) {
            this.list.push(g);
            this.layerCount[layer] = 1;
            return;
        }
        if (layer == 0) {
            this.list.splice(this.layerCount[0]++, 0, g);
            return;
        }
        if (layer == 1) {
            this.list.splice(this.layerCount[0] + this.layerCount[1]++, 0, g);
            return;
        }
        if (layer == 2) {
            this.list.splice(this.layerCount[0] + this.layerCount[1] + this.layerCount[2]++, 0, g);
            return;
        }
    };
    Level.prototype.addBgObjs = function (obj) {
        if (this.bgObjects.length >= 3) {
            console.log("Error: too many backgrounds");
            return;
        }
        else {
            this.bgObjects.push(obj);
        }
    };
    Level.prototype.getBgObjs = function () {
        return this.bgObjects;
    };
    Level.prototype.getPlayer = function () {
        return this.playerRef;
    };
    Level.prototype.getList = function () {
        return this.list;
    };
    Level.prototype.getTileMap = function () {
        return this.tileMap;
    };
    Level.prototype.getStart = function () {
        return this.startPos;
    };
    Level.prototype.getEnd = function () {
        return this.endPos;
    };
    Level.prototype.getCamera = function () {
        return this.camera;
    };
    return Level;
}());
// Information about 
var Scene = /** @class */ (function () {
    function Scene() {
    }
    return Scene;
}());
/// <reference path="GameObjects.ts" />
/// <reference path="Commands.ts" />
/// <reference path="Game.ts" />
var ControlScheme = /** @class */ (function () {
    function ControlScheme() {
    }
    return ControlScheme;
}());
var Button = /** @class */ (function () {
    function Button(key) {
        this.key = key;
        this.released = true;
        this.holdTime = 0;
        this.holdLevels = 0; //determines how many levels 
    }
    ;
    Button.prototype.setHoldLevels = function (levels) {
        this.holdLevels = levels;
    };
    Button.prototype.getKey = function () {
        return this.key;
    };
    Button.prototype.isReleased = function () {
        return this.released;
    };
    Button.prototype.setReleased = function (option) {
        this.released = option;
    };
    return Button;
}());
var Controller = /** @class */ (function () {
    function Controller() {
    }
    // public static UP_KEY_COMMAND: Command;
    // public static LEFT_KEY_COMMAND: Command;
    // public static RIGHT_KEY_COMMAND: Command;
    // public static UP_KEY_RELEASE_COMMAND: JumpCommand;
    // public static S_KEY_COMMAND: Command;
    // public static S_KEY_RELEASE_COMMAND: Command;
    Controller.init = function () {
        document.addEventListener('keydown', function (event) {
            Controller.KEYS = (Controller.KEYS || []);
            Controller.KEYS[event.keyCode] = true;
        });
        document.addEventListener('keyup', function (event) {
            if (Controller.KEYS[event.keyCode] === true) {
                Controller.KEYS[event.keyCode] = false;
            }
        });
        // this.UP_KEY_COMMAND = new JumpCommand();
        // this.LEFT_KEY_COMMAND = new MoveLeftCommand();
        // this.RIGHT_KEY_COMMAND = new MoveRightCommand();
        // this.UP_KEY_RELEASE_COMMAND = new MinJumpCommand();
        // this.S_KEY_COMMAND = new RunCommand();
        // this.S_KEY_RELEASE_COMMAND = new WalkCommand();
    };
    Controller.handleInput = function (p) {
        var temp = [];
        if (this.isKeyDown(this.S))
            temp.push(Commands.RUN);
        else
            temp.push(Commands.RUN_RELEASE);
        if (this.isKeyDown(this.LEFT))
            temp.push(Commands.LEFT);
        else if (this.isKeyDown(this.RIGHT))
            temp.push(Commands.RIGHT);
        if (this.isReleased(this.UP))
            temp.push(Commands.JUMP_RELEASE);
        if (this.isKeyDown(this.DOWN))
            temp.push(Commands.DUCK);
        else if (this.isPressed(this.UP))
            temp.push(Commands.JUMP);
        if (temp == [])
            return;
        else
            for (var _i = 0, temp_1 = temp; _i < temp_1.length; _i++) {
                var c = temp_1[_i];
                p.handleInput(c);
            }
    };
    Controller.isKeyDown = function (button) {
        if (Controller.KEYS && Controller.KEYS[button.getKey()] === true)
            return true;
        else
            return false;
    };
    Controller.isPressed = function (button) {
        if (Controller.KEYS && Controller.KEYS[button.getKey()] === true) {
            if (button.isReleased()) {
                button.setReleased(false);
                return true;
            }
            return false;
        }
        else {
            button.setReleased(true);
            return false;
        }
    };
    Controller.isReleased = function (button) {
        if (Controller.KEYS && Controller.KEYS[button.getKey()] === false) {
            if (button.isReleased()) {
                return true;
            }
            return false;
        }
    };
    Controller.UP = new Button(38);
    Controller.LEFT = new Button(37);
    Controller.RIGHT = new Button(39);
    Controller.DOWN = new Button(40);
    Controller.S = new Button(83);
    return Controller;
}());
/// <reference path="Commands.ts" />
/// <reference path="Controls.ts" />
/// <reference path="Game.ts" />
// compile: tsc --outFile src/game.js GameObjects.ts Commands.ts Controls.ts Game.ts
var BoundingBox = /** @class */ (function () {
    function BoundingBox(leftOffset, topOffset, rightOffset, bottomOffset) {
        this.leftOffset = leftOffset;
        this.topOffset = topOffset;
        this.rightOffset = rightOffset;
        this.bottomOffset = bottomOffset;
    }
    ;
    BoundingBox.prototype.getLeftOffset = function () {
        return this.leftOffset;
    };
    BoundingBox.prototype.getRightOffset = function () {
        return this.rightOffset;
    };
    BoundingBox.prototype.getTopOffset = function () {
        return this.topOffset;
    };
    BoundingBox.prototype.getBottomOffset = function () {
        return this.bottomOffset;
    };
    return BoundingBox;
}());
var GameObject = /** @class */ (function () {
    function GameObject(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.grounded = false;
        this.MAX_SPEED = 5;
        this.solid = false;
        this.topSolid = false;
        this.hasFriction = false;
        this.hasGravity = false;
        this.tileMap = null;
        this.x *= TileMap.UNIT;
        this.y *= TileMap.UNIT;
        this.width *= TileMap.UNIT;
        this.height *= TileMap.UNIT;
        this.color = "black";
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.friction = Physics.STANDARD_FRICTION;
        this.xInit = this.x;
        this.yInit = this.y;
        this.boundingBox = new BoundingBox(0, 0, 0, 0);
    }
    GameObject.prototype.update = function () {
        if (this.xVelocity != 0)
            this.x += this.xVelocity;
        if (this.yVelocity != 0)
            this.y += this.yVelocity;
        if (this.hasFriction)
            this.applyFriction();
        if (this.hasGravity) {
            if (!this.isGrounded() && this.getYVelocity() < Physics.MAX_FALL_SPEED)
                this.setYVelocity(this.getYVelocity() + Physics.GRAVITY);
            this.setGrounded(false);
        }
    };
    GameObject.prototype.collisionWith = function (obj) {
        if (this.isCollidingWith(obj)) {
            var thisCollision = new Collision(this, obj);
            var otherCollision = new Collision(obj, this);
            this.collision(obj, thisCollision);
            obj.collision(this, otherCollision);
        }
    };
    GameObject.prototype.setCustomBoundingBox = function (left, top, right, bottom) {
        this.boundingBox = new BoundingBox(left, top, right, bottom);
    };
    GameObject.prototype.getBoundingBox = function () {
        return this.boundingBox;
    };
    GameObject.prototype.setFrictionState = function (b) {
        this.hasFriction = b;
    };
    GameObject.prototype.setGravity = function (b) {
        this.hasGravity = b;
    };
    GameObject.prototype.setSolid = function (b) {
        this.solid = b;
        this.topSolid = b;
    };
    GameObject.prototype.setTopSolid = function (b) {
        this.topSolid = b;
    };
    GameObject.prototype.die = function () {
        this.dead = true;
    };
    GameObject.prototype.isDead = function () {
        return this.dead;
    };
    GameObject.prototype.isSolid = function () {
        return this.solid;
    };
    GameObject.prototype.isTopSolid = function () {
        return this.topSolid;
    };
    GameObject.prototype.setMaxSpeed = function (speed) {
        this.MAX_SPEED = speed;
    };
    GameObject.prototype.getMaxSpeed = function () {
        return this.MAX_SPEED;
    };
    GameObject.prototype.applyFriction = function () {
        if (Math.abs(this.xVelocity) != this.MAX_SPEED || this.xVelocity != 0) {
            if (this.xVelocity >= this.friction)
                this.xVelocity -= this.friction;
            else if (this.xVelocity <= -this.friction)
                this.xVelocity += this.friction;
            else {
                this.xVelocity = 0;
                this.movePositionTo(this.getX(), this.getY());
            }
        }
    };
    GameObject.prototype.reset = function () {
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.x = this.xInit;
        this.y = this.yInit;
    };
    GameObject.prototype.movePositionBy = function (xPos, yPos) {
        this.x += xPos;
        this.y += yPos;
    };
    GameObject.prototype.movePositionTo = function (xPos, yPos) {
        this.x = xPos;
        this.y = yPos;
    };
    GameObject.prototype.moveLeft = function () {
        if (this.getXVelocity() > -this.MAX_SPEED)
            this.setXVelocity(this.getXVelocity() - (this.getFriction() * 2));
        else if (this.getXVelocity() < -this.MAX_SPEED)
            this.setXVelocity(-this.MAX_SPEED);
    };
    GameObject.prototype.moveRight = function () {
        if (this.getXVelocity() < this.MAX_SPEED)
            this.setXVelocity(this.getXVelocity() + (this.getFriction() * 2));
        else if (this.getXVelocity() > this.MAX_SPEED)
            this.setXVelocity(this.MAX_SPEED);
    };
    GameObject.prototype.getInitX = function () {
        return this.xInit;
    };
    GameObject.prototype.getInitY = function () {
        return this.yInit;
    };
    GameObject.prototype.setXVelocity = function (amountX) {
        this.xVelocity = amountX;
    };
    GameObject.prototype.getXVelocity = function () {
        return this.xVelocity;
    };
    GameObject.prototype.setYVelocity = function (amountY) {
        this.yVelocity = amountY;
    };
    GameObject.prototype.getYVelocity = function () {
        return this.yVelocity;
    };
    GameObject.prototype.setFriction = function (f) {
        this.friction = f;
    };
    GameObject.prototype.getFriction = function () {
        return this.friction;
    };
    GameObject.prototype.getX = function () {
        return this.x;
    };
    GameObject.prototype.getY = function () {
        return this.y;
    };
    GameObject.prototype.getWidth = function () {
        return this.width;
    };
    GameObject.prototype.getHeight = function () {
        return this.height;
    };
    GameObject.prototype.getRight = function () {
        return this.x + this.width;
    };
    GameObject.prototype.getBottom = function () {
        return this.y + this.height;
    };
    GameObject.prototype.isGrounded = function () {
        return this.grounded;
    };
    GameObject.prototype.setGrounded = function (b) {
        this.grounded = b;
    };
    GameObject.prototype.setColor = function (c) {
        this.color = c;
    };
    GameObject.prototype.getColor = function () {
        return this.color;
    };
    GameObject.prototype.jump = function (power) {
        if (this.isGrounded()) {
            if (!power) // if power is null use max jump power!
                power = Physics.MAX_FALL_SPEED;
            else
                power = Math.abs(power);
            this.setFriction(this.getFriction() * Physics.STANDARD_JUMP_FRICTION_MULTIPLIER);
            this.setYVelocity(-power * .85);
        }
    };
    GameObject.prototype.hasTileMap = function () {
        return this.tileMap != null;
    };
    GameObject.prototype.getTileMap = function () {
        return this.tileMap;
    };
    GameObject.prototype.setTileMap = function (tMap) {
        this.tileMap = tMap;
    };
    GameObject.prototype.isCollidingWith = function (go, ray) {
        return ((this.getRight() + this.boundingBox.getRightOffset() > go.getX() - go.boundingBox.getLeftOffset() && this.getX() - this.boundingBox.getLeftOffset() < go.getRight() + go.boundingBox.getRightOffset()) && (this.getBottom() + 1 + this.boundingBox.getBottomOffset() > go.getY() - go.boundingBox.getTopOffset() && this.getY() - this.boundingBox.getTopOffset() < go.getBottom() + go.boundingBox.getBottomOffset())); // bottom+1 so sits on top of surface and not 1px inside of it
    };
    return GameObject;
}());
var TransitionScreen = /** @class */ (function (_super) {
    __extends(TransitionScreen, _super);
    function TransitionScreen(w, h) {
        return _super.call(this, 0, 0, w, h) || this;
    }
    TransitionScreen.prototype.collision = function (obj, collison) {
    };
    return TransitionScreen;
}(GameObject));
var BlackScreen = /** @class */ (function (_super) {
    __extends(BlackScreen, _super);
    function BlackScreen(w, h) {
        var _this = _super.call(this, w, h) || this;
        _this.alpha = 0;
        _this.setColor("rgba(0,0,0,0)");
        return _this;
    }
    BlackScreen.prototype.isDoneTransitioning = function () {
        return this.alpha == 1;
    };
    BlackScreen.prototype.transition = function () {
        if (!this.isDoneTransitioning()) {
            this.alpha += .0165;
            if (this.alpha > .98)
                this.alpha = 1;
            this.setColor("rgba(0,0,0," + this.alpha + ")");
        }
    };
    return BlackScreen;
}(TransitionScreen));
var ClearScreen = /** @class */ (function (_super) {
    __extends(ClearScreen, _super);
    function ClearScreen(w, h) {
        var _this = _super.call(this, w, h) || this;
        _this.alpha = 1;
        _this.setColor("rgba(0,0,0,1)");
        return _this;
    }
    ClearScreen.prototype.isDoneTransitioning = function () {
        return this.alpha == 0;
    };
    ClearScreen.prototype.transition = function () {
        if (!this.isDoneTransitioning()) {
            this.alpha -= .0165;
            if (this.alpha < .02)
                this.alpha = 0;
            this.setColor("rgba(0,0,0," + this.alpha + ")");
        }
    };
    return ClearScreen;
}(TransitionScreen));
var FocusBox = /** @class */ (function (_super) {
    __extends(FocusBox, _super);
    function FocusBox(x, y, width, height, follow) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.follow = follow;
        _this.setColor(null);
        _this.setFrictionState(false);
        return _this;
    }
    FocusBox.prototype.collision = function (obj) {
        // no collisions
    };
    FocusBox.prototype.update = function () {
        this.collisionWithFollow(this.follow);
    };
    FocusBox.prototype.collisionWithFollow = function (gameObject) {
        if (gameObject.getX() < this.getX())
            this.movePositionTo(gameObject.getX(), this.getY());
        if (gameObject.getRight() > this.getRight())
            this.movePositionTo(gameObject.getRight() - this.getWidth(), this.getY());
        if (gameObject.getY() < this.getY())
            this.movePositionTo(this.getX(), gameObject.getY());
        if (gameObject.getBottom() > this.getBottom())
            this.movePositionTo(this.getX(), gameObject.getBottom() - this.getHeight());
    };
    FocusBox.prototype.isCollidingWith = function (go) {
        return _super.prototype.isCollidingWith.call(this, go);
    };
    return FocusBox;
}(GameObject));
var Collision = /** @class */ (function () {
    function Collision(thisObject, otherObject) {
        this.top = Math.abs((otherObject.getBottom() + otherObject.getBoundingBox().getBottomOffset()) - (thisObject.getY() - thisObject.getBoundingBox().getTopOffset()));
        this.left = Math.abs((otherObject.getRight() + otherObject.getBoundingBox().getRightOffset()) - (thisObject.getX() - thisObject.getBoundingBox().getLeftOffset()));
        this.bottom = Math.abs((otherObject.getY() - otherObject.getBoundingBox().getTopOffset()) - (thisObject.getBottom() + thisObject.getBoundingBox().getBottomOffset()));
        this.right = Math.abs((otherObject.getX() - otherObject.getBoundingBox().getLeftOffset()) - (thisObject.getRight() + thisObject.getBoundingBox().getRightOffset()));
        this.thisYVelocity = thisObject.getYVelocity();
        this.thisXVelocity = thisObject.getXVelocity();
        this.otherXVelocity = otherObject.getXVelocity();
        this.otherYVelocity = otherObject.getYVelocity();
    }
    Collision.prototype.getOtherXVelocity = function () {
        return this.otherXVelocity;
    };
    Collision.prototype.getOtherYVelocity = function () {
        return this.otherYVelocity;
    };
    Collision.prototype.getThisXVelocity = function () {
        return this.thisXVelocity;
    };
    Collision.prototype.getThisYVelocity = function () {
        return this.thisYVelocity;
    };
    Collision.prototype.getTopOffset = function () {
        return this.top;
    };
    Collision.prototype.getBottomOffset = function () {
        return this.bottom;
    };
    Collision.prototype.getLeftOffset = function () {
        return this.left;
    };
    Collision.prototype.getRightOffset = function () {
        return this.right;
    };
    Collision.prototype.isCollidingWithTop = function () {
        return (this.top <= this.left && this.top <= this.bottom && this.top <= this.right); //&& this.yVelocity <= 0)
    };
    Collision.prototype.isCollidingWithBottom = function () {
        return (this.bottom <= this.left && this.bottom <= this.top && this.bottom <= this.right && this.thisYVelocity >= 0);
    };
    Collision.prototype.isCollidingWithLeft = function () {
        return (this.left <= this.top && this.left <= this.bottom && this.left <= this.right);
    };
    Collision.prototype.isCollidingWithRight = function () {
        return (this.right <= this.top && this.right <= this.bottom && this.right <= this.left);
    };
    return Collision;
}());
var PlayerState = /** @class */ (function () {
    function PlayerState() {
    }
    return PlayerState;
}());
var NormalState = /** @class */ (function (_super) {
    __extends(NormalState, _super);
    function NormalState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.MIN_JUMP = -8;
        return _this;
    }
    NormalState.prototype.enter = function (player) { };
    NormalState.prototype.exit = function (player) { };
    NormalState.prototype.hit = function (player) { };
    NormalState.prototype.handleInput = function (player, input) {
        switch (input) {
            case Commands.JUMP:
                player.jump();
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
            case Commands.JUMP_RELEASE:
                if (player.getYVelocity() < this.MIN_JUMP)
                    player.setYVelocity(this.MIN_JUMP);
                break;
            case Commands.LEFT:
                player.moveLeft();
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
            case Commands.RIGHT:
                player.moveRight();
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
            case Commands.RUN:
                if (player.getMaxSpeed() != Physics.STANDARD_MAX_RUN_SPEED)
                    player.setMaxSpeed(Physics.STANDARD_MAX_RUN_SPEED);
                break;
            case Commands.RUN_RELEASE:
                if (player.getMaxSpeed() != Physics.STANDARD_MAX_SPEED)
                    player.setMaxSpeed(Physics.STANDARD_MAX_SPEED);
                break;
            case Commands.DUCK:
                player.notifyAll(GameEvent.PLAYER_DUCK);
        }
    };
    NormalState.prototype.update = function (player) { };
    return NormalState;
}(PlayerState));
var SuperState = /** @class */ (function (_super) {
    __extends(SuperState, _super);
    function SuperState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.MIN_JUMP = -16;
        return _this;
    }
    return SuperState;
}(NormalState));
var DeadState = /** @class */ (function (_super) {
    __extends(DeadState, _super);
    function DeadState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.count = 0;
        _this.shouldUpdate = true;
        _this.stopVel = true;
        return _this;
    }
    DeadState.prototype.enter = function (player) {
        player.setXVelocity(0);
        player.setYVelocity(0);
        player.notifyAll(GameEvent.PLAYER_DIED);
    };
    DeadState.prototype.exit = function (player) {
    };
    DeadState.prototype.hit = function (player) {
    };
    DeadState.prototype.handleInput = function (player, command) {
    };
    DeadState.prototype.update = function (player) {
        if (this.shouldUpdate) {
            if (this.stopVel)
                player.setYVelocity(0);
            if (this.count++ == 30) {
                player.setYVelocity(-16);
                this.stopVel = false;
            }
            if (this.count == 180) {
                this.shouldUpdate = false;
                player.movePositionTo(-100, 1000); // kills player
            }
        }
    };
    return DeadState;
}(PlayerState));
var LaunchedState = /** @class */ (function (_super) {
    __extends(LaunchedState, _super);
    function LaunchedState(barrel) {
        var _this = _super.call(this) || this;
        _this.barrel = barrel;
        _this.hasLaunched = false;
        return _this;
    }
    LaunchedState.prototype.handleInput = function (player, input) {
        if (!this.hasLaunched && input == Commands.JUMP) {
            this.barrel.launch();
            player.notifyAll(GameEvent.PLAYER_MOVE);
        }
    };
    LaunchedState.prototype.update = function (player) {
        // keep rotating player
    };
    LaunchedState.prototype.hit = function (player) { };
    LaunchedState.prototype.enter = function (player) {
        player.setXVelocity(0);
        player.setYVelocity(0);
        // change to spinning animation!
    };
    LaunchedState.prototype.exit = function (player) { };
    return LaunchedState;
}(PlayerState));
var InvincibleState = /** @class */ (function (_super) {
    __extends(InvincibleState, _super);
    function InvincibleState(player) {
        var _this = _super.call(this) || this;
        _this.counter = 0;
        _this.color = player.getColor();
        return _this;
    }
    InvincibleState.prototype.enter = function (player) {
    };
    InvincibleState.prototype.exit = function (player) {
    };
    InvincibleState.prototype.handleInput = function (player, input) {
        //none
    };
    InvincibleState.prototype.update = function (player) {
        if (this.isInvincible()) {
            this.counter++;
            if (this.counter % 5 == 0)
                if (player.getColor() != this.color)
                    player.setColor(this.color);
                else
                    player.setColor(null);
        }
        else {
            player.setColor(this.color);
        }
    };
    InvincibleState.prototype.hit = function (player) {
    };
    InvincibleState.prototype.isInvincible = function () {
        return this.counter < 120;
    };
    return InvincibleState;
}(PlayerState));
var SwimState = /** @class */ (function (_super) {
    __extends(SwimState, _super);
    function SwimState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwimState.prototype.handleInput = function (player, input) {
        switch (input) {
            case Commands.JUMP:
                player.swim();
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
            case Commands.LEFT:
                player.moveLeft();
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
            case Commands.RIGHT:
                player.moveRight();
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
            case Commands.RUN:
                if (player.getMaxSpeed() != Physics.STANDARD_MAX_RUN_SPEED)
                    player.setMaxSpeed(Physics.STANDARD_MAX_RUN_SPEED);
                break;
            case Commands.RUN_RELEASE:
                if (player.getMaxSpeed() != Physics.STANDARD_MAX_SPEED)
                    player.setMaxSpeed(Physics.STANDARD_MAX_SPEED);
                break;
            case Commands.DUCK:
                var maxSwimFall = Physics.MAX_FALL_SPEED * .5;
                if (player.getYVelocity() < maxSwimFall)
                    player.setYVelocity(maxSwimFall);
                player.notifyAll(GameEvent.PLAYER_MOVE);
                break;
        }
    };
    SwimState.prototype.update = function (player) {
        if (player.getYVelocity() > 1)
            player.setYVelocity(player.getYVelocity() - (Physics.GRAVITY * .95));
    };
    SwimState.prototype.hit = function (player) { };
    SwimState.prototype.enter = function (player) {
        // change to swim graphics
    };
    SwimState.prototype.exit = function (player) { };
    return SwimState;
}(PlayerState));
var PlayerAbility = /** @class */ (function () {
    function PlayerAbility() {
    }
    return PlayerAbility;
}());
var DoubleJump = /** @class */ (function (_super) {
    __extends(DoubleJump, _super);
    function DoubleJump() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.canJump = false;
        return _this;
    }
    DoubleJump.prototype.handleInput = function (player, input) {
        if (input == Commands.JUMP)
            if (!player.groundedLastFrame() && this.canJump) {
                player.setYVelocity(-Physics.MAX_FALL_SPEED * .6);
                this.canJump = false;
            }
    };
    DoubleJump.prototype.update = function (player) {
        if (player.groundedLastFrame() && !this.canJump) {
            this.canJump = true;
            console.log("can jump");
        }
    };
    DoubleJump.prototype.hit = function (player) {
    };
    return DoubleJump;
}(PlayerAbility));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        var _this = _super.call(this, x, y, 1, 1) || this;
        _this.squished = false;
        _this.invincible = null;
        _this.swimState = null;
        _this.steps = 0;
        _this.lives = 2;
        _this.abilities = [];
        _this.wasGrounded = false; // was player grounded on the prior frame?
        _this.observers = [];
        _this.setColor("yellow");
        _this.setFrictionState(true);
        _this.setGravity(true);
        _this.originalColor = _this.getColor();
        _this.state = Player.NORMAL_STATE;
        return _this;
    }
    Player.prototype.handleInput = function (c) {
        if (this.hasAbilities() && !(this.state instanceof LaunchedState)) {
            for (var _i = 0, _a = this.abilities; _i < _a.length; _i++) {
                var a = _a[_i];
                a.handleInput(this, c);
            }
        }
        if (!this.swimState)
            this.state.handleInput(this, c);
        else
            this.swimState.handleInput(this, c);
    };
    Player.prototype.update = function () {
        this.wasGrounded = this.isGrounded();
        _super.prototype.update.call(this);
        if (this.swimState) {
            this.swimState.update(player);
            this.swimState = null;
        }
        this.state.update(this);
        if (this.hasAbilities()) {
            for (var _i = 0, _a = this.abilities; _i < _a.length; _i++) {
                var a = _a[_i];
                a.update(this);
            }
        }
        this.squished = false;
        if (this.invincible) {
            if (this.invincible.isInvincible())
                this.invincible.update(this);
            else
                this.invincible = null;
        }
    };
    Player.prototype.addObserver = function (obs) {
        this.observers.push(obs);
    };
    Player.prototype.notifyAll = function (event, message) {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var obs = _a[_i];
            obs.onNotify(this, event, message);
        }
    };
    Player.prototype.getLives = function () {
        return this.lives;
    };
    Player.prototype.addAbility = function (ability) {
        this.abilities.push(ability);
    };
    Player.prototype.hasAbilities = function () {
        return this.abilities != [];
    };
    Player.prototype.isDying = function () {
        return this.lives <= 0;
    };
    Player.prototype.determineState = function () {
        switch (this.lives) {
            case 0:
                Player.DEAD_STATE = new DeadState();
                Player.DEAD_STATE.enter(this);
                return Player.DEAD_STATE;
            case 1:
                Player.NORMAL_STATE.enter(this);
                return Player.NORMAL_STATE;
            case 2:
                Player.SUPER_STATE.enter(this);
                return Player.SUPER_STATE;
            default:
                Player.DEAD_STATE = new DeadState();
                Player.DEAD_STATE.enter(this);
                return Player.DEAD_STATE;
        }
    };
    Player.prototype.hit = function (amount) {
        if (!this.invincible && this.state != Player.DEAD_STATE) {
            if (amount == undefined)
                amount = 1;
            this.lives -= amount;
            if (this.lives > 0)
                this.invincible = new InvincibleState(this);
            else
                this.lives = 0;
            this.state.hit(player);
            this.state.exit(player);
            this.state = this.determineState();
            this.notifyAll(GameEvent.PLAYER_HIT);
        }
    };
    Player.prototype.isInvincible = function () {
        return true;
        // return this.state == State.INVINCIBLE;
    };
    Player.prototype.die = function () {
        GameManager.getInstance().restartLevel();
        this.lives = 2;
    };
    Player.prototype.swim = function () {
        this.setGrounded(true);
        this.jump(-12);
        this.setFriction(Physics.STANDARD_FRICTION);
    };
    Player.prototype.groundedLastFrame = function () {
        return this.wasGrounded;
    };
    Player.prototype.collision = function (go, collision) {
        if (go !== this && !this.isDying()) {
            if (go instanceof Spikes) {
                this.hit(3);
                return;
            }
            if (go instanceof Barrel) {
                this.state = new LaunchedState(go);
                return;
            }
            if (go instanceof Water) {
                if (this.state instanceof LaunchedState) {
                    this.state = this.determineState();
                }
                var swimFallSpeed = Physics.MAX_FALL_SPEED * .5;
                if (this.getYVelocity() > swimFallSpeed)
                    this.setYVelocity(swimFallSpeed);
                if (!this.swimState)
                    this.swimState = Player.SWIM_STATE;
                return;
            }
            if (go instanceof DoubleJumpPowerUp) {
                this.addAbility(new DoubleJump());
                return;
            }
            if (go instanceof WalkingEnemy || go instanceof Mouse) {
                if (collision.isCollidingWithBottom() && collision.getThisYVelocity() > 0) {
                    this.movePositionTo(this.getX(), go.getY() - this.getHeight());
                    this.setYVelocity(-Physics.MAX_FALL_SPEED);
                }
                //this.state == State.ALIVE && 
                else if ((collision.isCollidingWithTop() || collision.isCollidingWithLeft() || collision.isCollidingWithRight())) {
                    this.hit();
                }
                return;
            }
            if (go.isSolid()) {
                if (this.state instanceof LaunchedState) {
                    this.state = this.determineState();
                }
                // top collision
                if (collision.isCollidingWithTop()) {
                    if (go.getYVelocity() > 0) {
                        this.squished = true;
                        if (this.isGrounded()) {
                            this.hit(3);
                        }
                    }
                    this.movePositionBy(0, collision.getTopOffset());
                    this.setYVelocity(0);
                }
                // bottom collision
                else if (collision.isCollidingWithBottom()) {
                    if (this.squished) {
                        this.hit(3);
                        return;
                    }
                    //this.movePositionBy(0, -bottom);
                    this.movePositionTo(this.getX(), go.getY() - this.getHeight());
                    this.setYVelocity(0);
                    this.setFriction(go.getFriction());
                    this.setGrounded(true);
                }
                // left collision
                else if (collision.isCollidingWithLeft()) {
                    this.movePositionBy(collision.getLeftOffset(), 0);
                    this.setXVelocity(0);
                    //console.log("LEFT!")
                }
                // right collision
                else if (collision.isCollidingWithRight()) {
                    this.movePositionBy(-collision.getRightOffset(), 0);
                    this.setXVelocity(0);
                    //console.log("RIGHT!")
                }
                return;
            }
            if (go.isTopSolid()) {
                if (this.state instanceof LaunchedState) {
                    this.state = this.determineState();
                }
                if (collision.isCollidingWithTop() && go.getYVelocity() > 0) {
                    this.squished = true;
                    if (this.isGrounded()) {
                        this.hit(3);
                    }
                }
                if (collision.isCollidingWithBottom() && this.getBottom() < go.getY() + Physics.MAX_FALL_SPEED) {
                    if (this.squished) {
                        this.hit(3);
                        return;
                    }
                    //this.movePositionBy(0, -bottom);
                    this.movePositionTo(this.getX(), go.getY() - this.getHeight());
                    this.setYVelocity(0);
                    this.setFriction(go.getFriction());
                    //console.log("BOTTOM!")
                    this.setGrounded(true);
                    //this.notifyAll(GameEvent.DISPLAY_MESSAGE, "Hey there! This is a test!");
                }
                return;
            }
        }
    };
    Player.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.lives = 2;
        this.state = Player.NORMAL_STATE;
        this.invincible = null;
        this.setColor(this.originalColor);
    };
    Player.DEAD_STATE = new DeadState();
    Player.NORMAL_STATE = new NormalState();
    Player.SUPER_STATE = new SuperState();
    Player.SWIM_STATE = new SwimState();
    return Player;
}(GameObject));
var Direction;
(function (Direction) {
    Direction[Direction["LEFT"] = 0] = "LEFT";
    Direction[Direction["RIGHT"] = 1] = "RIGHT";
    Direction[Direction["UP"] = 2] = "UP";
    Direction[Direction["DOWN"] = 3] = "DOWN";
})(Direction || (Direction = {}));
var ColorTile = /** @class */ (function (_super) {
    __extends(ColorTile, _super);
    function ColorTile(x, y, w, h) {
        var _this = _super.call(this, x, y, w, h) || this;
        _this.setColor("rgba(0, 120, 160)");
        _this.setFrictionState(false);
        return _this;
    }
    ColorTile.prototype.collision = function (obj, collison) {
    };
    return ColorTile;
}(GameObject));
var Water = /** @class */ (function (_super) {
    __extends(Water, _super);
    function Water(x, y, w, h) {
        var _this = _super.call(this, x, y, w, h) || this;
        _this.playerWasInLastFrame = false;
        _this.playerIsInThisFrame = false;
        _this.playerCollide = false;
        _this.setColor("rgba(0, 120, 190, .6)");
        _this.setFrictionState(false);
        return _this;
    }
    Water.prototype.collision = function (obj, collison) {
        if (obj instanceof Player) {
            this.playerCollide = true;
            this.playerIsInThisFrame = true;
            if (!this.playerWasInLastFrame) {
                obj.setYVelocity(obj.getYVelocity() * .25);
            }
        }
    };
    Water.prototype.update = function () {
        this.playerWasInLastFrame = this.playerIsInThisFrame;
        if (!this.playerCollide) {
            this.playerIsInThisFrame = false;
        }
        this.playerCollide = false;
    };
    return Water;
}(GameObject));
var Barrel = /** @class */ (function (_super) {
    __extends(Barrel, _super);
    function Barrel(posX, posY, direction, vel) {
        var _this = _super.call(this, posX, posY, 2, 2) || this;
        _this.direction = direction;
        _this.launchVelocity = 25;
        _this.START_OF_CANNON_TILES = 22;
        _this.setColor("green");
        if (vel != undefined)
            _this.launchVelocity = Math.abs(vel);
        _this.currentSpriteSheet = GameManager.getInstance().getCurrentSprtiteSheet(); // find a better way to pass this over
        _this.setTileMap(_this.createTileMap());
        _this.halfHeight = _this.getHeight() / 2;
        _this.halfWidth = _this.getWidth() / 2;
        return _this;
    }
    Barrel.prototype.setDirection = function (dir) {
        this.direction = dir;
    };
    Barrel.prototype.setVelocity = function (vel) {
        this.launchVelocity = Math.abs(vel);
    };
    Barrel.prototype.collision = function (obj, collison) {
        if (obj instanceof Player) {
            this.launchObject = obj;
            this.launchObject.movePositionTo(this.getX(), this.getY());
            this.launchObject.setXVelocity(0);
            this.launchObject.setYVelocity(0);
            if (this.launchObject.getColor() != null)
                this.launchObjectPriorColor = this.launchObject.getColor();
            this.launchObject.setColor(null);
        }
    };
    Barrel.prototype.launch = function () {
        if (this.launchObject) {
            this.launchObject.setColor(this.launchObjectPriorColor);
            switch (this.direction) {
                case Direction.LEFT:
                    this.launchObject.movePositionTo(this.getX() - (this.launchObject.getWidth() + 1), this.getY() + this.halfWidth - (this.launchObject.getHeight() / 2));
                    this.launchObject.setXVelocity(-this.launchVelocity);
                    break;
                case Direction.RIGHT:
                    this.launchObject.movePositionTo(this.getRight() + 1, this.getY() + this.halfWidth - (this.launchObject.getHeight() / 2));
                    this.launchObject.setXVelocity(this.launchVelocity);
                    break;
                case Direction.UP:
                    this.launchObject.movePositionTo(this.getX() + this.halfWidth - (this.launchObject.getWidth() / 2), this.getY() - (this.launchObject.getHeight() + 1));
                    this.launchObject.setYVelocity(-this.launchVelocity);
                    break;
                case Direction.DOWN:
                    this.launchObject.movePositionTo(this.getX() + this.halfWidth - (this.launchObject.getWidth() / 2), this.getBottom() + 1);
                    this.launchObject.setYVelocity(this.launchVelocity);
                    break;
            }
            this.launchObject = null;
        }
    };
    Barrel.prototype.createTileMap = function () {
        var w = this.getWidth();
        var h = this.getHeight();
        var tMap = new TileMap(this.getX(), this.getY(), w, h, this.currentSpriteSheet);
        var tiles = [];
        var startingTile;
        var tileHeight = this.currentSpriteSheet.getTileHeight();
        var tileWidth = this.currentSpriteSheet.getTileWidth();
        var totalTiles = (w / tileWidth) * (h / tileHeight);
        switch (this.direction) {
            case Direction.LEFT:
                startingTile = this.START_OF_CANNON_TILES + totalTiles * 3;
                break;
            case Direction.RIGHT:
                startingTile = this.START_OF_CANNON_TILES + totalTiles;
                break;
            case Direction.UP:
                startingTile = this.START_OF_CANNON_TILES;
                break;
            case Direction.DOWN:
                startingTile = this.START_OF_CANNON_TILES + totalTiles * 2;
                break;
            default:
                startingTile = -totalTiles;
        }
        for (var i = 0; i < totalTiles; i++) {
            tiles.push(startingTile + i);
        }
        tMap.addTiles(tiles);
        return tMap;
    };
    return Barrel;
}(GameObject));
var MovingBarrel = /** @class */ (function (_super) {
    __extends(MovingBarrel, _super);
    function MovingBarrel(posX, posY, facingDirection, movingDirection, movingSpeed, distance, vel) {
        var _this = _super.call(this, posX, posY, facingDirection, vel) || this;
        _this.movingDirection = movingDirection;
        _this.movingSpeed = movingSpeed;
        _this.distance = distance;
        _this.vel = vel;
        _this.movingSpeed = Math.abs(_this.movingSpeed);
        _this.setStartMovement();
        _this.resetCounter();
        return _this;
    }
    MovingBarrel.prototype.update = function () {
        _super.prototype.update.call(this);
        this.counter++;
        if (this.counter % this.distance == 0) {
            this.setXVelocity(-this.getXVelocity());
            this.setYVelocity(-this.getYVelocity());
            this.counter = 0;
        }
    };
    MovingBarrel.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.setStartMovement();
        this.resetCounter();
    };
    MovingBarrel.prototype.setStartMovement = function () {
        switch (this.movingDirection) {
            case Direction.LEFT:
                this.setXVelocity(-this.movingSpeed);
                break;
            case Direction.RIGHT:
                this.setXVelocity(this.movingSpeed);
                break;
            case Direction.UP:
                this.setYVelocity(-this.movingSpeed);
                break;
            case Direction.DOWN:
                this.setYVelocity(this.movingSpeed);
                break;
        }
    };
    MovingBarrel.prototype.resetCounter = function () {
        this.counter = Math.round(this.distance / 2);
    };
    return MovingBarrel;
}(Barrel));
var Block = /** @class */ (function (_super) {
    __extends(Block, _super);
    function Block(x, y, width, height) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.setSolid(true);
        _this.currentSpriteSheet = GameManager.getInstance().getCurrentSprtiteSheet(); // find a better way to pass this over
        _this.setTileMap(_this.createTileMap());
        return _this;
    }
    Block.prototype.collision = function (obj, collision) {
        return;
    };
    Block.prototype.createTileMap = function () {
        var tMap = new TileMap(this.getX(), this.getY(), this.getWidth(), this.getHeight(), this.currentSpriteSheet);
        var tiles = [];
        var w = this.getWidth();
        var h = this.getHeight();
        var tileHeight = this.currentSpriteSheet.getTileHeight();
        var tileWidth = this.currentSpriteSheet.getTileWidth();
        for (var i = 0; i <= h - tileHeight; i += tileHeight) {
            for (var j = 0; j <= w - tileWidth; j += tileWidth) {
                if (i == 0 && j == 0) // TOP LEFT TILE
                 {
                    tiles.push(5);
                }
                else if (i == 0 && j == w - tileWidth) // TOP RIGHT TILE
                 {
                    tiles.push(6);
                }
                else if (i == 0) {
                    tiles.push(4);
                }
                else if (j == w - tileWidth) {
                    tiles.push(3);
                }
                else if (j == 0) {
                    tiles.push(2);
                }
                else {
                    tiles.push(1);
                }
            }
        }
        tMap.addTiles(tiles);
        return tMap;
    };
    return Block;
}(GameObject));
var OnOffControlBlock = /** @class */ (function (_super) {
    __extends(OnOffControlBlock, _super);
    function OnOffControlBlock(x, y) {
        var _this = _super.call(this, x, y, 1, 1) || this;
        _this.innerOnState = false;
        _this.setSolid(true);
        _this.currentSpriteSheet = GameManager.getInstance().getCurrentSprtiteSheet(); // find a better way to pass this over
        _this.setTileMap(_this.createTileMap(OnOffControlBlock.ON));
        return _this;
    }
    OnOffControlBlock.prototype.collision = function (obj, collision) {
        if (obj instanceof Player) {
            if (collision.isCollidingWithBottom()) {
                OnOffControlBlock.ON = !OnOffControlBlock.ON;
                this.innerOnState = OnOffControlBlock.ON;
                this.setTileMap(this.createTileMap(OnOffControlBlock.ON));
            }
        }
        return;
    };
    OnOffControlBlock.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.innerOnState != OnOffControlBlock.ON) {
            this.innerOnState = OnOffControlBlock.ON;
            this.setTileMap(this.createTileMap(OnOffControlBlock.ON));
        }
    };
    OnOffControlBlock.GET_ON_STATE = function () {
        return OnOffControlBlock.ON;
    };
    // ON  = TRUE
    // OFF = FALSE
    OnOffControlBlock.prototype.createTileMap = function (on) {
        var tMap = new TileMap(this.getX(), this.getY(), this.getWidth(), this.getHeight(), this.currentSpriteSheet);
        var tiles = [];
        if (on)
            tiles.push(17);
        else
            tiles.push(18);
        tMap.addTiles(tiles);
        return tMap;
    };
    OnOffControlBlock.ON = false;
    return OnOffControlBlock;
}(GameObject));
var BlueBlock = /** @class */ (function (_super) {
    __extends(BlueBlock, _super);
    function BlueBlock(x, y, width, height) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.setBlockProperties();
        return _this;
    }
    BlueBlock.prototype.collision = function (obj, collison) {
    };
    BlueBlock.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.onState != OnOffControlBlock.GET_ON_STATE()) {
            this.setBlockProperties();
        }
    };
    BlueBlock.prototype.setBlockProperties = function () {
        this.onState = OnOffControlBlock.GET_ON_STATE();
        this.determineStateAndSetColor(63, 72, 204, false);
    };
    BlueBlock.prototype.determineStateAndSetColor = function (r, g, b, on) {
        if (this.onState == on) {
            this.setSolid(true);
            this.setColor("rgb(" + r + ", " + g + ", " + b + ")");
        }
        else {
            this.setSolid(false);
            this.setColor("rgba(" + r + ", " + g + ", " + b + ", .3)");
        }
    };
    return BlueBlock;
}(GameObject));
var RedBlock = /** @class */ (function (_super) {
    __extends(RedBlock, _super);
    function RedBlock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // OVERRIDE
    RedBlock.prototype.setBlockProperties = function () {
        this.onState = OnOffControlBlock.GET_ON_STATE();
        this.determineStateAndSetColor(237, 28, 36, true);
    };
    return RedBlock;
}(BlueBlock));
var TopSolidBlock = /** @class */ (function (_super) {
    __extends(TopSolidBlock, _super);
    function TopSolidBlock(x, y, width, height) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.setColor("gray");
        _this.setSolid(false);
        _this.setTopSolid(true);
        return _this;
    }
    TopSolidBlock.prototype.collision = function (obj, collision) {
        //none
    };
    return TopSolidBlock;
}(Block));
var IceBlock = /** @class */ (function (_super) {
    __extends(IceBlock, _super);
    function IceBlock(x, y, width, height) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.setColor("cyan");
        _this.setFriction(Physics.ICE_FRICTION);
        return _this;
    }
    return IceBlock;
}(Block));
var RiseAndFallBlock = /** @class */ (function (_super) {
    __extends(RiseAndFallBlock, _super);
    function RiseAndFallBlock(x, y, width, height) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.count = 0;
        _this.setCustomBoundingBox(0, 5, 0, 0);
        return _this;
    }
    // @Override
    RiseAndFallBlock.prototype.update = function () {
        var vel = Math.sin(this.count / 50) * 2;
        this.setXVelocity(vel);
        this.setYVelocity(-vel);
        this.count++;
        _super.prototype.update.call(this);
    };
    RiseAndFallBlock.prototype.collision = function (go, collision) {
        if (go instanceof Player) {
            var p = go;
            if (p.isDying())
                return;
        }
        if (go instanceof Player || go instanceof Enemy) {
            if (collision.isCollidingWithTop() && go.getYVelocity() >= 0) { // regular bounding box collision
                var xVel = this.getXVelocity();
                if (xVel != 0) {
                    go.movePositionBy(xVel, 0);
                }
                go.movePositionTo(go.getX(), this.getY() - (go.getHeight()));
            }
        }
    };
    RiseAndFallBlock.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.count = 0;
    };
    return RiseAndFallBlock;
}(TopSolidBlock));
var Spikes = /** @class */ (function (_super) {
    __extends(Spikes, _super);
    function Spikes(x, y, w) {
        var _this = _super.call(this, x, y, w, 1) || this;
        _this.setColor("red");
        _this.currentSpriteSheet = GameManager.getInstance().getCurrentSprtiteSheet(); // find a better way to pass this over
        _this.setTileMap(_this.createTileMap());
        return _this;
    }
    Spikes.prototype.collision = function (obj, collision) {
        return;
    };
    Spikes.prototype.createTileMap = function () {
        var w = this.getWidth();
        var tMap = new TileMap(this.getX(), this.getY(), w, this.getHeight(), this.currentSpriteSheet);
        var tileWidth = this.currentSpriteSheet.getTileWidth();
        var tiles = [];
        for (var i = 0; i < w; i += tileWidth)
            tiles.push(16);
        tMap.addTiles(tiles);
        return tMap;
    };
    return Spikes;
}(GameObject));
var Enemy = /** @class */ (function (_super) {
    __extends(Enemy, _super);
    function Enemy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Enemy.prototype.collision = function (obj, collision) {
        return;
    };
    return Enemy;
}(GameObject));
var WalkingEnemy = /** @class */ (function (_super) {
    __extends(WalkingEnemy, _super);
    function WalkingEnemy(x, y) {
        var _this = _super.call(this, x, y, 1, 1) || this;
        _this.speed = 3;
        _this.setColor("red");
        _this.setGravity(true);
        _this.setXVelocity(-_this.speed);
        return _this;
        //this.setSolid(true);
    }
    WalkingEnemy.prototype.collision = function (obj, collision) {
        if (obj instanceof Player) {
            if (collision.isCollidingWithTop() && collision.getOtherYVelocity() > 0) {
                this.die();
                return;
            }
        }
        if (obj.isSolid()) {
            if (collision.isCollidingWithBottom()) {
                this.movePositionTo(this.getX(), obj.getY() - this.getHeight());
                this.setYVelocity(0);
                this.setGrounded(true);
            }
            else if (collision.isCollidingWithLeft()) {
                this.setXVelocity(this.speed);
                this.movePositionBy(collision.getLeftOffset(), 0);
            }
            else if (collision.isCollidingWithRight()) {
                this.setXVelocity(-this.speed);
                this.movePositionBy(-collision.getRightOffset(), 0);
            }
            return;
        }
        if (obj.isTopSolid()) {
            if (collision.isCollidingWithBottom()) {
                this.movePositionTo(this.getX(), obj.getY() - this.getHeight());
                this.setYVelocity(0);
                this.setGrounded(true);
            }
            return;
        }
    };
    WalkingEnemy.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.setXVelocity(-this.speed);
    };
    return WalkingEnemy;
}(Enemy));
var DoubleJumpPowerUp = /** @class */ (function (_super) {
    __extends(DoubleJumpPowerUp, _super);
    function DoubleJumpPowerUp(posX, posY) {
        var _this = _super.call(this, posX, posY, 1, 1) || this;
        _this.setColor("orange");
        return _this;
    }
    DoubleJumpPowerUp.prototype.collision = function (obj, collison) {
        if (obj instanceof Player)
            this.die();
    };
    return DoubleJumpPowerUp;
}(GameObject));
var MessageTrigger = /** @class */ (function (_super) {
    __extends(MessageTrigger, _super);
    function MessageTrigger(posX, posY, w, h, message, destroyable) {
        var _this = _super.call(this, posX, posY, w, h) || this;
        _this.message = message;
        _this.destroyable = destroyable;
        _this.setColor(null);
        return _this;
    }
    MessageTrigger.prototype.collision = function (obj, collison) {
        if (obj instanceof Player) {
            obj.notifyAll(GameEvent.DISPLAY_MESSAGE, this.message);
            if (this.destroyable)
                this.die();
        }
    };
    return MessageTrigger;
}(GameObject));
var Collectable = /** @class */ (function (_super) {
    __extends(Collectable, _super);
    function Collectable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Collectable.prototype.setLetter = function (l) {
        this.letter = l.charAt(0);
    };
    Collectable.prototype.getLetter = function () {
        return this.letter;
    };
    return Collectable;
}(GameObject));
var Letter = /** @class */ (function (_super) {
    __extends(Letter, _super);
    function Letter(x, y) {
        var _this = _super.call(this, x, y, 1, 1) || this;
        _this.FONT_THINKNESS = 900;
        _this.FONT_SIZE = 28;
        _this.FONT = "Georgia";
        _this.FONT_COLOR = "black";
        _this.setColor("yellow");
        if (Letter.count >= LevelUI.letters.length) {
            _this.die();
        }
        else {
            _this.setLetter(LevelUI.letters.charAt(Letter.count++));
        }
        return _this;
    }
    Letter.prototype.collision = function (obj, collison) {
        if (obj instanceof Player) {
            obj.notifyAll(GameEvent.LETTER_COLLECTED, this.getLetter());
            this.die();
        }
    };
    Letter.prototype.getFont = function () {
        return this.FONT_THINKNESS + " " + this.FONT_SIZE + "px " + this.FONT;
    };
    Letter.prototype.getFontColor = function () {
        return this.FONT_COLOR;
    };
    Letter.prototype.getFontSize = function () {
        return this.FONT_SIZE;
    };
    Letter.count = 0;
    return Letter;
}(Collectable));
var Cagie = /** @class */ (function (_super) {
    __extends(Cagie, _super);
    function Cagie(x, y, w, h, level) {
        var _this = _super.call(this, x, y, w, h) || this;
        _this.level = level;
        _this.setSolid(true);
        _this.setColor("yellow");
        _this.ui = level.getLevelUI();
        return _this;
    }
    Cagie.prototype.collision = function (obj, collison) {
    };
    Cagie.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.ui.allLettersCollected()) {
            this.die();
            this.level.notifyAll(GameEvent.DISPLAY_MESSAGE, "Nice! Cagie unlocked!");
        }
    };
    return Cagie;
}(GameObject));
var Mouse = /** @class */ (function (_super) {
    __extends(Mouse, _super);
    function Mouse(attachment, offsetX, offsetY, speed) {
        var _this = _super.call(this, (attachment.getX() / TileMap.UNIT) + offsetX, (attachment.getY() / TileMap.UNIT) + offsetY, 1, 1) || this;
        _this.attachment = attachment;
        _this.offsetX = offsetX;
        _this.offsetY = offsetY;
        _this.speed = speed;
        _this.counter = 0;
        _this.animation = false;
        _this.MOUSE_TILE_UP = 38;
        _this.MOUSE_TILE_DOWN = 40;
        _this.currentSpriteSheet = GameManager.getInstance().getCurrentSprtiteSheet();
        _this.up1 = new TileMap(0, 0, _this.getWidth(), _this.getHeight(), _this.currentSpriteSheet);
        _this.up1.addTiles([_this.MOUSE_TILE_UP]);
        _this.up2 = new TileMap(0, 0, _this.getWidth(), _this.getHeight(), _this.currentSpriteSheet);
        _this.up2.addTiles([_this.MOUSE_TILE_UP + 1]);
        _this.down1 = new TileMap(0, 0, _this.getWidth(), _this.getHeight(), _this.currentSpriteSheet);
        _this.down1.addTiles([_this.MOUSE_TILE_DOWN]);
        _this.down2 = new TileMap(0, 0, _this.getWidth(), _this.getHeight(), _this.currentSpriteSheet);
        _this.down2.addTiles([_this.MOUSE_TILE_DOWN + 1]);
        _this.delay = Math.round(Math.random() * 10);
        _this.setYVelocity(Math.abs(speed));
        _this.setGravity(false);
        _this.setFrictionState(false);
        _this.setTileMap(_this.up1);
        return _this;
    }
    Mouse.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.setTileMap(this.up1);
        this.setYVelocity(Math.abs(this.speed));
    };
    Mouse.prototype.collision = function (obj, collision) {
        if (obj instanceof Player) {
            if (collision.isCollidingWithTop() && collision.getOtherYVelocity() > 0) {
                this.die();
                return;
            }
        }
    };
    Mouse.prototype.update = function () {
        _super.prototype.update.call(this);
        if (this.getY() < this.attachment.getY()) {
            this.movePositionTo(this.getX(), this.attachment.getY());
            this.setYVelocity(-this.getYVelocity());
            console.log("above");
        }
        else if (this.getBottom() > this.attachment.getBottom()) {
            this.movePositionTo(this.getX(), this.attachment.getBottom() - this.getHeight());
            this.setYVelocity(-this.getYVelocity());
            console.log("below");
        }
        if (++this.counter % 10 == 0) {
            if (this.animation) {
                // switch
                if (this.getYVelocity() < 0) {
                    this.setTileMap(this.up1);
                }
                else {
                    this.setTileMap(this.down1);
                }
            }
            else {
                // switch
                if (this.getYVelocity() < 0) {
                    this.setTileMap(this.up2);
                }
                else {
                    this.setTileMap(this.down2);
                }
            }
            this.animation = !this.animation;
            this.counter = 0;
        }
    };
    return Mouse;
}(Enemy));
var TitleScreenController = /** @class */ (function (_super) {
    __extends(TitleScreenController, _super);
    function TitleScreenController() {
        return _super.call(this, 0, 0) || this;
    }
    TitleScreenController.prototype.handleInput = function (c) {
        if (c == Commands.JUMP) {
            GameManager.getInstance().setTileScreen(false);
        }
    };
    return TitleScreenController;
}(Player));
var UNIT = TileMap.UNIT;
var titleScreenImage = new Image();
titleScreenImage.src = "imgs/title_screen.png";
var jungleSpriteSheet = new SpriteSheet(UNIT, UNIT, "imgs/tile_map.png");
var jungleTileMap = new TileMap(0, UNIT * 4, UNIT * 6, UNIT * 12, jungleSpriteSheet);
var tiles = [0];
jungleTileMap.addTiles(tiles);
var gameManager = GameManager.getInstance();
var srn = new GameScreen("game");
var player = new Player(2, 12);
var focusBox = new FocusBox(2, 9, 4, 8, player);
var messageBox = new MessageBox(srn.getCanvas().width, 20);
player.addObserver(messageBox);
//focusBox.setColor("red");
var camera = new Camera(focusBox, srn.getCanvas().width, srn.getCanvas().height);
var level1 = new Level(jungleTileMap, camera);
level1.addBgObjs(new BackBackgroundObject(0, 0, "imgs/back_bg.png"));
level1.addBgObjs(new MidBackgroundObject(0, 0, "imgs/mid_bg.png"));
level1.addBgObjs(new TopBackgroundObject(0, 0, "imgs/top_bg.png"));
level1.addObserver(messageBox);
gameManager.setCurrentGameScreen(srn);
gameManager.setCurrentLevel(level1);
gameManager.setCurrentCamera(camera);
var list;
level1.add(player, 1);
level1.add(focusBox, 1);
level1.add(new Spikes(10, 1, 4), 0);
level1.add(new Block(-2, 0, 2, 20), 0);
level1.add(new RiseAndFallBlock(0, 9, 4, 1), 2);
level1.add(new WalkingEnemy(2, -1), 1);
level1.add(new WalkingEnemy(14, 0), 1);
var bigTop = new TopSolidBlock(10, 2, 7, 12);
level1.add(bigTop, 0);
level1.add(new Mouse(bigTop, 0, 2, 2));
//level1.add(new TopSolidBlock(2, 10, 2, 1)),0;
var topsoltest = new TopSolidBlock(14, 7, 2, 7);
level1.add(topsoltest, 0);
level1.add(new Mouse(topsoltest, 1, 2, 3));
level1.add(new TopSolidBlock(13, 9, 2, 5), 0);
level1.add(new TopSolidBlock(12, 11, 2, 4), 0);
// level1.add(new Block(470, 360, 64, 64));
level1.add(new TopSolidBlock(25, 8, 12, 7), 0);
level1.add(new Block(0, 14, 19, 2));
//lev1el.add(new Spikes(690, 420));
level1.add(new Block(21, 14, 17, 2));
level1.add(new BlueBlock(29, 11, 4, 1));
level1.add(new RedBlock(35, 11, 4, 1));
level1.add(new MessageTrigger(2, 2, 2, 2, "This is a cannon. A canon will launch you in the direction shown on the front of \nthe cannon. Press the JUMP (up key) button to fire!", true));
level1.add(new Barrel(2, 2, Direction.UP, 30));
level1.add(new Barrel(2, -6, Direction.UP, 30));
level1.add(new Barrel(2, -14, Direction.RIGHT, 30));
level1.add(new MovingBarrel(11, -14, Direction.RIGHT, Direction.UP, 7, 45, 30));
level1.add(new MovingBarrel(20, -14, Direction.RIGHT, Direction.DOWN, 7, 45, 30));
level1.add(new MovingBarrel(30, -14, Direction.DOWN, Direction.UP, 3, 45, 30));
level1.add(new MovingBarrel(81, 6, Direction.RIGHT, Direction.UP, 7, 45, 30));
level1.add(new MovingBarrel(91, 6, Direction.RIGHT, Direction.DOWN, 7, 45, 30));
level1.add(new MovingBarrel(101, 6, Direction.RIGHT, Direction.UP, 3, 45, 30));
level1.add(new Cagie(111, -15, 2, 30, level1));
level1.add(new Block(117, 14, 25, 2));
level1.add(new MessageTrigger(117, 13, 25, 2, "Congrats! You made it through the first floor of the Impossible Lair! \nHowever, the second floor is still underconstruction...                              \n\nThanks for playing!", true));
level1.add(new BlueBlock(27, -4, 2, 5));
level1.add(new DoubleJumpPowerUp(30, 0));
level1.add(new MessageTrigger(30, 0, 1, 1, "You have received the Double Jump Power-up! Try jumping and then jumping \nagain while in mid-air!", true));
level1.add(new BlueBlock(32, -4, 2, 5));
level1.add(new OnOffControlBlock(34, 0));
level1.add(new Letter(15, 0));
level1.add(new Letter(34, -5));
level1.add(new Letter(47, 13));
level1.add(new Letter(63, -16));
level1.add(new MessageTrigger(60, -13, 7, 7, "This yellow box is called a \"Cagie 2D.0\". The only way to open it \nis to find all of the B-E-R-T letters!", true));
level1.add(new Cagie(61, -12, 5, 5, level1));
level1.add(new Block(55, 6, 2, 9));
level1.add(new Block(59, -6, 9, 15));
level1.add(new RedBlock(68, 0, 2, 1));
level1.add(new OnOffControlBlock(63, -11));
level1.add(new Block(59, 13, 9, 2));
level1.add(new Spikes(46, 14, 3));
level1.add(new Block(42, 2, 2, 14));
level1.add(new BlueBlock(42, -15, 2, 17));
level1.add(new ColorTile(44, 3, 31, 12), 0);
level1.add(new Water(44, 3, 31, 12));
level1.add(new Block(44, 15, 32, 1));
level1.add(new Block(75, 2, 4, 14));
level1.add(new RedBlock(79, -15, 4, 17));
list = level1.getList();
var animateCount = 0;
function main() {
    var me = window.requestAnimationFrame(main);
    var tsc = new TitleScreenController();
    var titleText = "Press the 'Up Arrow Key' to Play!";
    srn.getContext().font = "900 16px Arial";
    Renderer.clearGameScreen(srn, "rgb(135,206,250)");
    if (gameManager.getTitleScreen()) {
        Controller.handleInput(tsc);
        srn.getContext().drawImage(titleScreenImage, 0, 0);
        if (animateCount++ < 10) {
            srn.getContext().fillStyle = "black";
            srn.getContext().fillText(titleText, (srn.getCanvas().width / 2) - (srn.getContext().measureText(titleText).width / 2), 440);
        }
        else if (animateCount < 30) {
        }
        else if (animateCount < 50) {
            srn.getContext().fillStyle = "black";
            srn.getContext().fillText(titleText, (srn.getCanvas().width / 2) - (srn.getContext().measureText(titleText).width / 2), 440);
        }
        else if (animateCount < 70) {
        }
        else if (animateCount < 90) {
            srn.getContext().fillStyle = "black";
            srn.getContext().fillText(titleText, (srn.getCanvas().width / 2) - (srn.getContext().measureText(titleText).width / 2), 430);
        }
        else if (animateCount < 110) {
        }
        else {
            animateCount = -70;
        }
    }
    else {
        var listSize = list.length;
        var removalList = []; // indicies where objects should be removed
        if (!srn.objectIsInBounds(player)) {
            gameManager.restartLevel();
        }
        Controller.handleInput(player);
        //update before collision for player grounded to reset!
        player.update();
        messageBox.update();
        level1.getLevelUI().update();
        for (var _i = 0, list_5 = list; _i < list_5.length; _i++) {
            var go = list_5[_i];
            if (!(go instanceof Player) && srn.shouldUpdate(go))
                go.update();
        }
        //collision checks
        for (var z = 0; z < listSize; z++) {
            var obj = list[z];
            if (!(obj instanceof Player))
                player.collisionWith(obj);
        }
        for (var i = 0; i < listSize - 1; i++) {
            for (var j = i + 1; j < listSize; j++) //collision testing
             {
                if (list[j].isDead() || list[i].isDead() || list[i] instanceof Player || list[j] instanceof Player || !srn.shouldUpdate(list[i]) || !srn.shouldUpdate(list[j]))
                    continue;
                list[i].collisionWith(list[j]);
            }
            if (list[i].isDead()) {
                removalList.push(i); //push dead objects on
                // if the last item in the list is dead push it on
                if (i == listSize - 2)
                    removalList.push(j);
            }
        }
        if (list.length != 0)
            gameManager.removeDeadObjects(removalList);
        camera.update(level1);
        Renderer.renderLevel(srn, level1);
    }
    // TRANSITION IF NEEDED
    transition();
}
function transition() {
    if (gameManager.isTransitioning()) {
        gameManager.transition();
        if (gameManager.isTransitionHalfwayDone())
            gameManager.notify();
    }
}
Controller.init();
main();

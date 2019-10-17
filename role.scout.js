require('prototype.creep');
var memoryRoomInit = require('memory.room.init');
var roleScout = {

    run: function (creep) {
        var creepHome = creep.memory.home;
        var adjRoomNameN = Memory.rooms[creepHome].roomNameN;
        var adjRoomNameS = Memory.rooms[creepHome].roomNameS;
        var adjRoomNameE = Memory.rooms[creepHome].roomNameE;
        var adjRoomNameW = Memory.rooms[creepHome].roomNameW;

        if (creep.room.name == creep.memory.home) {
            if (!Memory.rooms[adjRoomNameN]) {
                creep.moveToRoom(creep.memory.home, adjRoomNameN);
            }
            else if (!Memory.rooms[adjRoomNameS]) {
                creep.moveToRoom(creep.memory.home, adjRoomNameS);
            }
            else if (!Memory.rooms[adjRoomNameE]) {
                creep.moveToRoom(creep.memory.home, adjRoomNameE);
            }
            else if (!Memory.rooms[adjRoomNameW]) {
                creep.moveToRoom(creep.memory.home, adjRoomNameW);
            }
            else {
                creep.suicide();
            }
        }
        else {
            memoryRoomInit.run(false, creep.room);
            creep.moveToRoom(creep.room.name, creep.memory.home);
        }
    }
};

module.exports = roleScout;
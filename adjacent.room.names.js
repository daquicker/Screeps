function splitOriginRoomName(originRoom) {
    let result = {};
    let originRoomName = originRoom.name;
    for (let ind in originRoomName) {
        if (originRoomName[ind] == 'N' || originRoomName[ind] == 'S') {
            var splitPos = ind;
            break;
        }
    }
    result.EWPart = originRoomName.slice(0, splitPos);
    result.NSPart = originRoomName.slice(splitPos);
    result.EWPartLetter = result.EWPart[0];
    result.EWPartNums = parseInt(result.EWPart.substr(1));
    result.NSPartLetter = result.NSPart[0];
    result.NSPartNums = parseInt(result.NSPart.substr(1));
    return result;
};

function shiftNorthSouth(originRoomName, directionA, directionB) {
    if (originRoomName.NSPartNums == 0 && originRoomName.NSPartLetter == directionA) {
        // originRoom is on directionA 0
        var targetNSPartNums = originRoomName.NSPartNums;
        var targetNSPartLetter = directionB;
    }
    else if (originRoomName.NSPartLetter == directionA) {
        // originRoom is on directionA x (x != 0)
        var targetNSPartNums = originRoomName.NSPartNums - 1;
        var targetNSPartLetter = originRoomName.NSPartLetter
    }
    else {
        // originRoom is on directionB x
        var targetNSPartNums = originRoomName.NSPartNums + 1;
        var targetNSPartLetter = originRoomName.NSPartLetter;
    }
    return originRoomName.EWPart + targetNSPartLetter + targetNSPartNums;
};

function shiftEastWest(originRoomName, directionA, directionB) {
    if (originRoomName.EWPartNums == 0 && originRoomName.EWPartLetter == directionA) {
        // originRoom is on directionA 0
        var targetEWPartNums = originRoomName.EWPartNums;
        var targetEWPartLetter = directionB;
    }
    else if (originRoomName.EWPartLetter == directionA) {
        // originRoom is on directionA x (x != 0)
        var targetEWPartNums = originRoomName.EWPartNums - 1;
        var targetEWPartLetter = originRoomName.EWPartLetter
    }
    else {
        // originRoom is on directionB x
        var targetEWPartNums = originRoomName.EWPartNums + 1;
        var targetEWPartLetter = originRoomName.EWPartLetter;
    }
    return targetEWPartLetter + targetEWPartNums + originRoomName.NSPart;
};

module.exports = {
    north: function (originRoom) {
        let originRoomName = splitOriginRoomName(originRoom);
        return shiftNorthSouth(originRoomName, 'S', 'N');
    },

    south: function (originRoom) {
        let originRoomName = splitOriginRoomName(originRoom);
        return shiftNorthSouth(originRoomName, 'N', 'S');
    },

    east: function (originRoom) {
        let originRoomName = splitOriginRoomName(originRoom);
        return shiftEastWest(originRoomName, 'W', 'E');
    },

    west: function (originRoom) {
        let originRoomName = splitOriginRoomName(originRoom);
        return shiftEastWest(originRoomName, 'E', 'W');
    }
};
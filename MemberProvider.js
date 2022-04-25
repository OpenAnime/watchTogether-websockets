let users = [];

function joinUser(socketId, userName, roomName, currentlyWatching) {
    const user = {
        socketID: socketId,
        username: userName,
        roomname: roomName,
        creatorOptions: {
            currentlyWatching: currentlyWatching
        }
    }
    users.push(user)
    return user;
}

function removeUser(id) {
    const getID = users => users.socketID === id;
    const index = users.findIndex(getID);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getUsers() {
    return users;
}

module.exports = {
    joinUser,
    removeUser,
    getUsers
}
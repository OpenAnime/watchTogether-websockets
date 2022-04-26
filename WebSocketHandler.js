const { joinUser, removeUser, getUsers } = require("./MemberProvider")
const options={
     cors:true,
    origins:["http://127.0.0.1:3000"],
   }



const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = require("socket.io")(server, options)

server.listen(3000, () => {
    console.log('listening on *:3000');
  });



//server clientdan mesaj beklemeli ve gelen mesajı odadaki tüm kullanıcılara broadcast etmeli

io.on("connection", (socket) => {
    let socketID; //should store the socketID 
    socketID = socket.id
    console.log("baglandi komutanim o7")


    socket.on("join room", (data) => {
        console.log("odaya giriş yapıldı")
        let getAll = getUsers().find(x => x.socketID == socket.id)
        let roomGet = getUsers().find(x => x.roomname == data.roomName)
        if(getAll !== undefined) { //handle if the participant switches the room without leaving the current room
            removeUser(socket.id)
        }

        let newUser;
        if(roomGet == undefined) { //truthy if the user will be the room creator

            /*TODO: get the anime name from the creator of the room then if some participant joins the room get the current anime 
            name from the participant's browser if participant has a different anime page open 
            navigate the participant to the anime page we fetched before from the room creator */

            newUser = joinUser(socket.id, data.username, data.roomName, data.location) 

        } else {

            //if not room creator

            newUser = joinUser(socket.id, data.username, data.roomName, null) 
            let fetchOptions = getUsers().find(x => x.creatorOptions.currentlyWatching)
            console.log("options:", fetchOptions)
            socket.emit("changeLocation", {
                changeTo: fetchOptions.creatorOptions.currentlyWatching
            })
        }

        socket.emit("send data", {
            id: socket.id,
            username: newUser.username,
            roomname: newUser.roomname
        })
        socket.join(newUser.roomname) //socket idsini alıp belirtilen rooma socket idsi ile bağlanır 
        console.log(newUser)
    })

    socket.on("changeVideoStatus", (data) => {
        let getUser = getUsers().find(x => x.socketID == socket.id)
        if(getUser !== undefined) { //shouldn't use io.in(...).emit() cuz it will create a loop. We should send the message to all participants in the room except the sender
            socket.broadcast.to(getUser.roomname).emit("videoStatusChanged", data)
        } else {
            console.log("undefined verdi lan")
        } 
    })

    socket.on("serverMessage", async(data) => {
        let getUser = getUsers().find(x => x.socketID == socket.id)
        if(getUser !== undefined) {
            io.in(getUser.roomname).emit("clientMessage", {
                messageContent: data,
                author: getUser.username
            })
        } else {
            console.log("undefined verdi lan")
        }
    })

    socket.on("disconnect", () => {
        removeUser(socketID)
        console.log(getUsers())
    })
})
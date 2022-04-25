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
    let socketID;
    socketID = socket.id
    console.log("baglandi komutanim o7")
    socket.on("join room", (data) => {
        console.log("odaya giriş yapıldı")
        let getAll = getUsers().find(x => x.socketID == socket.id)
        if(getAll !== undefined) {
            removeUser(socket.id)
        }
        let newUser = joinUser(socket.id, data.username, data.roomName)
        socket.emit("send data", {
            id: socket.id,
            username: newUser.username,
            roomname: newUser.roomname
        })
        socket.join(newUser.roomname) //socket idsini alıp belirtilen rooma socket idsi ile bağlanır 
        console.log(newUser)
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
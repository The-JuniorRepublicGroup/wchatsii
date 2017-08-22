const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;




// connect to mongo
mongo.connect('mongodb://127.0.0.1/wchatsii', function(err, db){
    if(err){
        throw err;
    } else {
        console.log('Mongodb is connected.... 4000');
    }

    // Connect to socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        //create function to send status 
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            } else {


                // emit the messages
                socket.emit('output',res);
            }
        });

        //handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;


            //check for name and message
            if(name === '' || message === ''){
                //send an error here
                sendStatus('Please enter name AND message');
            } else {
                // insert message into db
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);


                    sendStatus({
                        message: 'Message Sent',
                        clear: true
                    });
                });
            }
        });

        //handle clear messages button
        socket.on('clear', function(data){
            //remove all chats from the collection
            chat.remove({}, function(){
                socket.emit('cleared');
            });
        });

    });
    
});


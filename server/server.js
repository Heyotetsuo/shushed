#!/usr/bin/env node

var WebSocket = require('ws');
var PORT = 8080;
var serverSocket = new WebSocket.Server({ port: PORT });

function handleClose()
{
        console.log( "Client disconnected" );
}
function handleConnection( socket )
{
        function isValid( client )
        {
                return (
                        client !== socket &&
                        client.readyState === WebSocket.OPEN
                );
        }
        function handleIncoming( message )
        {
                message = message.toString();
                for( var client of serverSocket.clients )
                {
                        if ( isValid(client) ) client.send( message );
                }
        }
        console.log( "Client connected" );
        socket.on( "message", handleIncoming  );
        socket.on( "close",   handleClose  );
}
function main()
{
        serverSocket.on( "connection", handleConnection );
        console.log( "WebSocket signaling server running on port", PORT );
}
main();

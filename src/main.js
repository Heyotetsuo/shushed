const { Filesystem } = window.Capacitor.Plugins;

var IP     = "10.1.13.100";
var PORT   = "8080";
var CTX    = new AudioContext();
var CHUNKS = [];
var AUDIO_EL;

function sleep( ms )
{
        function doSleep( res ) { setTimeout( res, ms ); }
        return new Promise( doSleep );
}
async function ls()
{
        // Directories
        // DOCUMENTS
        // DATA
        // LIBRARY
        // CACHE
        // EXTERNAL
        // EXTERNAL_STORAGE
        // EXTERNAL_CACHE
        // LIBRARY_NO_CLOUD
        // TEMPORARY
        // console.log( Object.keys(Directory) );
        // var { files } = await Filesystem.readdir( { path: ".", directory: "TEMPORARY"} );
        // for( var file of files )
        // {
        //         console.log( file.name );
        // }
}
async function createAndSendOffer( connection, socket )
{
        var offer = await connection.createOffer();
        await connection.setLocalDescription( offer );
        socket.send( JSON.stringify({offer}) );
}
function setupSocketHandler( connection, socket )
{
        async function handleMessage()
        {
                var message = JSON.parse( event.data );
                if ( message.answer ) await connection.setRemoteDescription( message.answer );
                if ( message.candidate ) await connection.addIceCandidate( message.candidate );
        }
        socket.addEventListener( "message", handleMessage );
}
function setupConnection( socket, stream )
{
        function connectCandidate()
        {
                console.log( "event.candidate", event.candidate );
                if ( !event.candidate ) return; // would be weird if you didn't have a candidate

                var candidate = JSON.stringify( { candidate: event.candidate } );
                socket.send( candidate );
        }
        var connection = new RTCPeerConnection();
        var tracks     = stream.getTracks();
        for( var track of tracks ) connection.addTrack( track, stream );
        connection.addEventListener( "icecandidate", connectCandidate );
        return connection;
}
async function connectSocket( url )
{
        function doConnect( res )
        {
                var socket = new WebSocket( url );
                socket.addEventListener( "open", ()=>{res(socket);} );
        }
        return new Promise( doConnect );
}
async function startStream()
{
        var socket     = await connectSocket( `ws://${IP}:${PORT}` );
        var stream     = await navigator.mediaDevices.getUserMedia({audio:true});
        var connection = setupConnection( socket, stream );

        setupSocketHandler( connection, socket );
        await createAndSendOffer( connection, socket );
}
function init()
{
        document.querySelector( "#start-btn" ).addEventListener( "click", startStream );
}
function main()
{
        init();
}

main();

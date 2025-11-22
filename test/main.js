var AUDIO_EL = document.querySelector( "audio" );

function connectSignaling( url )
{
        function doConnect( res )
        {
                var ws = new WebSocket( url );
                ws.addEventListener( "open", ()=>{res(ws)} );
        }
        return new Promise( doConnect );
}
function setupPeerConnection( signaling )
{
        function handleCandidate()
        {
                var { candidate } = event;
                if ( ! candidate ) return;
                var payload = JSON.stringify( { candidate } );
                signaling.send( payload );
        }
        function handleTrack()
        {
                AUDIO_EL.srcObj = event.streams[0];
        }
        var pc = new RTCPeerConnection();
        pc.addEventListener( "icecandidate", handleCandidate );
        pc.addEventListener( "track", handleTrack );
        return pc;
}
function setupSignalingHandler(pc, signaling)
{
        function handleMessage()
        {
                var message = JSON.parse( event.data );
                var { offer, candidate } = message;
                var payload, answer;
                if ( offer )
                {
                        await pc.setRemoteDescription( offer );

                        answer = await pc.createAnswer();
                        await pc.setLocalDescription( answer );

                        payload = JSON.stringify( { answer } );
                        signaling.send( payload );
                }
                if ( candidate )
                {
                        await pc.addIceCandidate( candidate );
                }
        }
        signaling.addEventListener( "message", handleMessage );
}
function init()
{
        var audioEl = document.querySelector( "#playback" );
        audioEl.addEventListener( "click", audioEl.play );
}
async function main()
{
        init();

        const signalingUrl = "ws://192.168.50.46:8080"; // Replace with your LAN server URL
        const signaling    = await connectSignaling( signalingUrl );
        const pc           = setupPeerConnection(    signaling    );

        setupSignalingHandler( pc, signaling );
}
main();

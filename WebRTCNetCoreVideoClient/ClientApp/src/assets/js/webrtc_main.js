'use strict';

//var serverInput = document.getElementById('serverInput');
//var connectButton = document.getElementById('connectButton');
//var disconnectButton = document.getElementById('disconnectButton');

var reqConnect;
var reqMessage;
var connectionId = -1;
var pc;

var m_server = "";
//if (document.location.host)
  //  server = "http://" + document.location.host;

/*
if (connectButton) {
    connectButton.onclick = connect;
    disconnectButton.onclick = disconnect;
    //serverInput.value = server;
}
*/

function send(type, data) {
    var r = new XMLHttpRequest();
  r.open("POST", m_server + "?" + type,
           true);
    r.setRequestHeader("Content-Type", "text/plain");
    r.setRequestHeader("Pragma", connectionId);
    r.send(data);
    console.log('Send(' + type + '):\n' + data + ')');
    r = null;
}

function onIceCandidate(event) {
    console.log('onIceCandidate()');
    if (event.candidate) {
        send('candidate', JSON.stringify({
            type: 'candidate',
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        }));

    } else {
        console.log('End of candidates.');
    }
}

function onRemoteStreamAdded(event) {
    console.log('onRemoteStreamAdded()');
    remoteVideo.srcObject = event.stream;
}

function onRemoteStreamRemoved(event) {
    console.log('onRemoteStreamRemoved()');
}


function onCreateAnswer(sdp)
{
    console.log('onCreateAnswer()');
    pc.setLocalDescription(sdp);
    send("answer", sdp.sdp);
}

function onCreateAnswerError(error) {
    console.log('onCreateAnswerError(). Failed to create session description: ' + error.toString());
}

function onSetRemoteDesc()
{
    pc.createAnswer().then(
      onCreateAnswer,
      onCreateAnswerError
    );
}

function onSetRemoteDescError(error) {
    console.log('onSetRemoteDescError(). Failed to create session description: ' + error.toString());
}

function CreatePeerConnection(message) {
    console.log('CreatePeerConnnection()');
    try {
        //var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        //pc = new RTCPeerConnection(config);
        pc = new RTCPeerConnection({
            iceServers: [
              {
                  urls: "stun:stun.l.google.com:19302"
              }
            ]
        });
        //pc = new RTCPeerConnection(null);
        pc.onicecandidate = onIceCandidate;
        pc.onaddstream = onRemoteStreamAdded;
        pc.onremovestream = onRemoteStreamRemoved;

        pc.setRemoteDescription(new RTCSessionDescription(message)).then(
          onSetRemoteDesc,
          onSetRemoteDescError
        );
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
    }
}

function connectCallback() {
    try {
        if (reqConnect.readyState == 4) {
            if (reqConnect.status == 200) {
                connectionId = reqConnect.getResponseHeader("Pragma")
                reqConnect = null;
                //if (connectButton != null) {
                    //connectButton.disabled = true;
                    //disconnectButton.disabled = false;
                //}
                GetMessage();
            }
            else {
                console.log("Connection error:" + reqConnect.status +
                    " " + reqConnect.statusText);
                //if (connectButton != null) {
                  //  connectButton.disabled = false;
                    //disconnectButton.disabled = true;
                //}
            }
        }
    } catch (e) {
        console.log("connectCallback() error: " + e.description);
    }
}


function disconnect(server)
{
  console.log('disconnect()');
     
    //if (connectButton != null) {
      //  connectButton.disabled = false;
        //disconnectButton.disabled = true;
    //}

    if (reqConnect) {
        reqConnect.abort();
        reqConnect = null;
    }

    if (connectionId != -1) {
        reqConnect = new XMLHttpRequest();
        reqConnect.open("GET", server + "?disconnect", true);
        reqConnect.setRequestHeader("Pragma", connectionId);
        reqConnect.send();
        reqConnect = null;
        connectionId = -1;
    }

    if (reqMessage) {
        reqMessage.abort();
        reqMessage = null;
    }

    if (pc != null)
    {
        pc.close();
    }
}

//////////////////
function GetMessage() {
    console.log('GetMessage()...');
    try {
        reqMessage = new XMLHttpRequest();
        reqMessage.onreadystatechange = GetMessageCallback;
        reqMessage.ontimeout = onGetMessageTimeout;
      reqMessage.open("GET", m_server + "?wait", true);
        reqMessage.setRequestHeader("Pragma", connectionId);
        reqMessage.send();
    } catch (e) {
        console.log("GetMessage() error: " + e.description);
    }
}

function onGetMessageTimeout() {
    console.log('GetMessageTimeout()');
    reqMessage.abort();
    reqMessage = null;
    window.setTimeout(GetMessage, 0);
}

function GetMessageCallback() {
    try {
        if (reqMessage.readyState != 4)
            return;
        if (reqMessage.status != 200) {
            console.log("GetMessageCallback() error:" + reqMessage.status +
                                " " + reqMessage.statusText);
            disconnect();
        }
        else {
            handleGetMessage(reqMessage.responseText)
        }

        if (reqMessage) {
            reqMessage.abort();
            reqMessage = null;
        }

        if (connectionId != -1)
            window.setTimeout(GetMessage, 0);
    } catch (e) {
        console.log("GetMessageCallback() error: " + e.description);
    }
}

function handleGetMessage(data) {
    var dataJson;
    try {
        dataJson = JSON.parse(data);
    }
    catch (e) {
        console.log("handleGetMessage() error: " + e.description);
    }
    if (dataJson.candidate)
    {
        console.log("handleGetMessage(), received:\n" + dataJson.candidate);
        var candidate = new RTCIceCandidate({ sdpMLineIndex: dataJson.sdpMLineIndex, candidate: dataJson.candidate });
        pc.addIceCandidate(candidate);
    }
    else if (dataJson.sdp)
    {
        console.log("handleGetMessage(), received:\n" + dataJson.sdp);
        CreatePeerConnection(dataJson);
    }
}

function connect(server) {
    try {
        //console.log("serverInput: " + serverInput);
        //if (serverInput) {
        //    server = serverInput.value;
       // }
        m_server = server;
        console.log("Connecting to: " + server);
        reqConnect = new XMLHttpRequest();
        reqConnect.onreadystatechange = connectCallback;
        reqConnect.open("GET", server + "?connect", true);
        reqConnect.send();
    }
    catch (e) {
        console.log("connect() error: " + e.description);
    }
}

//if (!connectButton) {
  //  window.onload = connect();
//}

//

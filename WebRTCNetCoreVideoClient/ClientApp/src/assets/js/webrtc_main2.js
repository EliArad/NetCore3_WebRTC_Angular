'use strict';


var reqConnect2;
var reqMessage2;
var connectionId2 = -1;
var pc2;

var m_server2 = "";


function send2(type, data) {
    var r = new XMLHttpRequest();
    r.open("POST", m_server2 + "?" + type,
           true);
    r.setRequestHeader("Content-Type", "text/plain");
    r.setRequestHeader("Pragma", connectionId2);
    r.send(data);
    console.log('Send2(' + type + '):\n' + data + ')');
    r = null;
}

function onIceCandidate2(event) {
    console.log('onIceCandidate2()');
    if (event.candidate) {
        send2('candidate', JSON.stringify({
            type: 'candidate',
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        }));

    } else {
        console.log('End of candidates.');
    }
}

function onRemoteStreamAdded2(event) {
    console.log('onRemoteStreamAdded2()');
    remoteVideo2.srcObject = event.stream;
}

function onRemoteStreamRemoved2(event) {
    console.log('onRemoteStreamRemoved2()');
}


function onCreateAnswer2(sdp)
{
    console.log('onCreateAnswer2()');
    pc2.setLocalDescription(sdp);
    send2("answer", sdp.sdp);
}

function onCreateAnswerError2(error) {
    console.log('onCreateAnswerError2(). Failed to create session description: ' + error.toString());
}

function onSetRemoteDesc2()
{
    pc2.createAnswer().then(
      onCreateAnswer2,
      onCreateAnswerError2
    );
}

function onSetRemoteDescError2(error) {
    console.log('onSetRemoteDescError2(). Failed to create session description: ' + error.toString());
}

function CreatePeerConnection2(message) {
    console.log('CreatePeerConnnection2()');
    try {
        //var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
        //pc2 = new RTCPeerConnection(config);
        pc2 = new RTCPeerConnection({
            iceServers: [
              {
                  urls: "stun:stun.l.google.com:19302"
              }
            ]
        });
        //pc2 = new RTCPeerConnection(null);
        pc2.onicecandidate = onIceCandidate2;
        pc2.onaddstream = onRemoteStreamAdded2;
        pc2.onremovestream = onRemoteStreamRemoved2;

        pc2.setRemoteDescription(new RTCSessionDescription(message)).then(
          onSetRemoteDesc2,
          onSetRemoteDescError2
        );
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
    }
}

function connectCallback2() {
    try {
        if (reqConnect2.readyState == 4) {
            if (reqConnect2.status == 200) {
                connectionId2 = reqConnect2.getResponseHeader("Pragma")
                reqConnect2 = null;
                GetMessage2();
            }
            else {
                console.log("Connection error:" + reqConnect2.status +
                    " " + reqConnect2.statusText);

            }
        }
    } catch (e) {
        console.log("connectCallback2() error: " + e.description);
    }
}


function disconnect2(server)
{
  console.log('disconnect()');
     
    

    if (reqConnect2) {
        reqConnect2.abort();
        reqConnect2 = null;
    }

    if (connectionId2 != -1) {
        reqConnect2 = new XMLHttpRequest();
        reqConnect2.open("GET", server + "?disconnect", true);
        reqConnect2.setRequestHeader("Pragma", connectionId2);
        reqConnect2.send();
        reqConnect2 = null;
        connectionId2 = -1;
    }

    if (reqMessage2) {
        reqMessage2.abort();
        reqMessage2 = null;
    }

    if (pc2 != null)
    {
        pc2.close();
    }
}

//////////////////
function GetMessage2() {
    console.log('GetMessage2()...');
    try {
        reqMessage2 = new XMLHttpRequest();
        reqMessage2.onreadystatechange = GetMessageCallback2;
        reqMessage2.ontimeout = onGetMessageTimeout2;
        reqMessage2.open("GET", m_server2 + "?wait", true);
        reqMessage2.setRequestHeader("Pragma", connectionId2);
        reqMessage2.send();
    } catch (e) {
        console.log("GetMessage2() error: " + e.description);
    }
}

function onGetMessageTimeout2() {
    console.log('GetMessageTimeout()');
    reqMessage2.abort();
    reqMessage2 = null;
    window.setTimeout(GetMessage2, 0);
}

function GetMessageCallback2() {
    try {
        if (reqMessage2.readyState != 4)
            return;
        if (reqMessage2.status != 200) {
            console.log("GetMessageCallback2() error:" + reqMessage2.status +
                                " " + reqMessage2.statusText);
            disconnect2();
        }
        else {
            handleGetMessage2(reqMessage2.responseText)
        }

        if (reqMessage2) {
            reqMessage2.abort();
            reqMessage2 = null;
        }

        if (connectionId2 != -1)
            window.setTimeout(GetMessage2, 0);
    } catch (e) {
        console.log("GetMessageCallback2() error: " + e.description);
    }
}

function handleGetMessage2(data) {
    var dataJson;
    try {
        dataJson = JSON.parse(data);
    }
    catch (e) {
        console.log("handleGetMessage2() error: " + e.description);
    }
    if (dataJson.candidate)
    {
        console.log("handleGetMessage2(), received:\n" + dataJson.candidate);
        var candidate = new RTCIceCandidate({ sdpMLineIndex: dataJson.sdpMLineIndex, candidate: dataJson.candidate });
        pc2.addIceCandidate(candidate);
    }
    else if (dataJson.sdp)
    {
        console.log("handleGetMessage2(), received:\n" + dataJson.sdp);
        CreatePeerConnection2(dataJson);
    }
}

function connect2(server) {
  try
  {
        m_server2 = server;
        console.log("Connecting to: " + server);
        reqConnect2 = new XMLHttpRequest();
        reqConnect2.onreadystatechange = connectCallback2;
        reqConnect2.open("GET", server + "?connect", true);
        reqConnect2.send();
    }
    catch (e) {
        console.log("error #8911 connect() error: " + e.description);
    }
}


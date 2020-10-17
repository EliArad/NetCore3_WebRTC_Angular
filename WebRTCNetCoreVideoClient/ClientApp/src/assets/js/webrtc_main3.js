'use strict';


var reqConnect3;
var reqMessage3;
var connectionId3 = -1;
var pc3;

var m_server3 = "";


function send3(type, data) {
    var r = new XMLHttpRequest();
    r.open("POST", m_server3 + "?" + type,
           true);
    r.setRequestHeader("Content-Type", "text/plain");
    r.setRequestHeader("Pragma", connectionId3);
    r.send(data);
    console.log('Send3(' + type + '):\n' + data + ')');
    r = null;
}

function onIceCandidate3(event) {
    console.log('onIceCandidate3()');
    if (event.candidate) {
        send3('candidate', JSON.stringify({
            type: 'candidate',
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        }));

    } else {
        console.log('End of candidates.');
    }
}

function onRemoteStreamAdded3(event) {
    console.log('onRemoteStreamAdded3()');
    remoteVideo3.srcObject = event.stream;
}

function onRemoteStreamRemoved3(event) {
    console.log('onRemoteStreamRemoved3()');
}


function onCreateAnswer3(sdp)
{
    console.log('onCreateAnswer3()');
    pc3.setLocalDescription(sdp);
    send3("answer", sdp.sdp);
}

function onCreateAnswerError3(error) {
    console.log('onCreateAnswerError3(). Failed to create session description: ' + error.toString());
}

function onSetRemoteDesc3()
{
    pc3.createAnswer().then(
      onCreateAnswer3,
      onCreateAnswerError3
    );
}

function onSetRemoteDescError3(error) {
    console.log('onSetRemoteDescError3(). Failed to create session description: ' + error.toString());
}

function CreatePeerConnection3(message) {
    console.log('CreatePeerConnnection3()');
    try {
        //var config = { "iceServers": [{ "url": "stun:stun.l.google.com:19303" }] };
        //pc3 = new RTCPeerConnection(config);
        pc3 = new RTCPeerConnection({
            iceServers: [
              {
                  urls: "stun:stun.l.google.com:19302"
              }
            ]
        });
        //pc3 = new RTCPeerConnection(null);
        pc3.onicecandidate = onIceCandidate3;
        pc3.onaddstream = onRemoteStreamAdded3;
        pc3.onremovestream = onRemoteStreamRemoved3;

        pc3.setRemoteDescription(new RTCSessionDescription(message)).then(
          onSetRemoteDesc3,
          onSetRemoteDescError3
        );
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
    }
}

function connectCallback3() {
    try {
        if (reqConnect3.readyState == 4) {
            if (reqConnect3.status == 200) {
                connectionId3 = reqConnect3.getResponseHeader("Pragma")
                reqConnect3 = null;
                GetMessage3();
            }
            else {
                console.log("Connection error:" + reqConnect3.status +
                    " " + reqConnect3.statusText);

            }
        }
    } catch (e) {
        console.log("connectCallback3() error: " + e.description);
    }
}


function disconnect3(server)
{
  console.log('disconnect()');
     
    

    if (reqConnect3) {
        reqConnect3.abort();
        reqConnect3 = null;
    }

    if (connectionId3 != -1) {
        reqConnect3 = new XMLHttpRequest();
        reqConnect3.open("GET", server + "?disconnect", true);
        reqConnect3.setRequestHeader("Pragma", connectionId3);
        reqConnect3.send();
        reqConnect3 = null;
        connectionId3 = -1;
    }

    if (reqMessage3) {
        reqMessage3.abort();
        reqMessage3 = null;
    }

    if (pc3 != null)
    {
        pc3.close();
    }
}

//////////////////
function GetMessage3() {
    console.log('GetMessage3()...');
    try {
        reqMessage3 = new XMLHttpRequest();
        reqMessage3.onreadystatechange = GetMessageCallback3;
        reqMessage3.ontimeout = onGetMessageTimeout3;
        reqMessage3.open("GET", m_server3 + "?wait", true);
        reqMessage3.setRequestHeader("Pragma", connectionId3);
        reqMessage3.send();
    } catch (e) {
        console.log("GetMessage3() error: " + e.description);
    }
}

function onGetMessageTimeout3() {
    console.log('GetMessageTimeout()');
    reqMessage3.abort();
    reqMessage3 = null;
    window.setTimeout(GetMessage3, 0);
}

function GetMessageCallback3() {
    try {
        if (reqMessage3.readyState != 4)
            return;
        if (reqMessage3.status != 200) {
            console.log("GetMessageCallback3() error:" + reqMessage3.status +
                                " " + reqMessage3.statusText);
            disconnect3();
        }
        else {
            handleGetMessage3(reqMessage3.responseText)
        }

        if (reqMessage3) {
            reqMessage3.abort();
            reqMessage3 = null;
        }

        if (connectionId3 != -1)
            window.setTimeout(GetMessage3, 0);
    } catch (e) {
        console.log("GetMessageCallback3() error: " + e.description);
    }
}

function handleGetMessage3(data) {
    var dataJson;
    try {
        dataJson = JSON.parse(data);
    }
    catch (e) {
        console.log("handleGetMessage3() error: " + e.description);
    }
    if (dataJson.candidate)
    {
        console.log("handleGetMessage3(), received:\n" + dataJson.candidate);
        var candidate = new RTCIceCandidate({ sdpMLineIndex: dataJson.sdpMLineIndex, candidate: dataJson.candidate });
        pc3.addIceCandidate(candidate);
    }
    else if (dataJson.sdp)
    {
        console.log("handleGetMessage3(), received:\n" + dataJson.sdp);
        CreatePeerConnection3(dataJson);
    }
}

function connect3(server) {
  try
  {
        m_server3 = server;
        console.log("Connecting to: " + server);
        reqConnect3 = new XMLHttpRequest();
        reqConnect3.onreadystatechange = connectCallback3;
        reqConnect3.open("GET", server + "?connect", true);
        reqConnect3.send();
    }
    catch (e) {
        console.log("error #8911 connect() error: " + e.description);
    }
}


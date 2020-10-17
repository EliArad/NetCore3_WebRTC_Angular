import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


 

declare var connect2: any;
declare var disconnect2: any;

@Component({
  selector: 'app-web-rtc2',
  templateUrl: './web-rtc2.component.html',
  styleUrls: ['./web-rtc2.component.css']
})
export class WebRTC2Component implements AfterViewInit {


  server2: string = "http://10.0.0.10:8052/";

  //disableDisconnectButton: boolean = true;
  //disableConnectButton: boolean = false;
  

  constructor(http: HttpClient)
  {
     
  }

  ngAfterViewInit()
  {

     this.Connect();
       
  }

  public Connect()
  {

    new connect2(this.server2);

    //this.disableConnectButton = true;
    //this.disableDisconnectButton = false;

  }
  public Disconnect()
  {


    new disconnect2(this.server2);
    //this.disableConnectButton = false;
    //this.disableDisconnectButton = true;
  }

  
}

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


declare var connect: any;
declare var disconnect: any;

declare var connect2: any;
declare var disconnect2: any;

@Component({
  selector: 'app-web-rtc',
  templateUrl: './web-rtc.component.html',
  styleUrls: ['./web-rtc.component.css']
})
export class WebRTCComponent implements AfterViewInit  {
   

  server1: string = "http://10.0.0.10:8051/";
  

  disableDisconnectButton: boolean = true;
  disableConnectButton: boolean = false;
  

  constructor(http: HttpClient)
  {

  }
  
  ngAfterViewInit() {
   
      this.Connect();   
  }

  public Connect()
  { 
    new connect(this.server1);

    this.disableConnectButton = true;
    this.disableDisconnectButton = false;

  }
  public Disconnect()
  {

    new disconnect(this.server1);

    this.disableConnectButton = false;
    this.disableDisconnectButton = true;
  }
   

}

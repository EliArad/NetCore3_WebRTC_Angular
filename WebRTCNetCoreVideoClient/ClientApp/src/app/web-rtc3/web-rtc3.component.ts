import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

 

declare var connect3: any;
declare var disconnect3: any;

@Component({
  selector: 'app-web-rtc3',
  templateUrl: './web-rtc3.component.html',
  styleUrls: ['./web-rtc3.component.css']
})
export class WebRTC3Component implements AfterViewInit {




  server3: string = "http://10.0.0.10:8053/";

  //disableDisconnectButton: boolean = true;
  //disableConnectButton: boolean = false;
  

  constructor(http: HttpClient)
  {

  }
   

  ngAfterViewInit() {

      this.Connect();
         
  }

  public Connect() {

    new connect3(this.server3);

    //this.disableConnectButton = true;
    //this.disableDisconnectButton = false;

  }
  public Disconnect() {


    new disconnect3(this.server3);
    //this.disableConnectButton = false;
    //this.disableDisconnectButton = true;
  }

  
}

import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  video : any;
  title = 'tensorflowapp';
  liveView = document.getElementById('liveView');
  
  constructor(){
    this.video = document.getElementsByTagName('video')[0];
    console.log(this.video);
  }
  ngOnInit() {
    
    var browser = <any>navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);
      
      console.log(this.video);
      browser.mediaDevices.getUserMedia({video: true}).then((stream: any) => {
        this.video.srcObject = stream;
        this.video.play();
        // this.video.addEventListener('loadeddata', this.predictWebcam);
    });
  
  }
  predictWebcam(): any {

  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tfjs from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  video : any;
  title = 'tensorflowapp';
  liveView: any;
  children = [];
  model: any
  constructor(){
    tfjs.setBackend('cpu');
  }
  ngOnInit() {
    this.video = document.getElementById('webcam');
    this.liveView = document.getElementById('liveView');   
    this.enableCam();
  }
  async enableCam() {
    var browser = <any>navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);
      
    await cocoSsd.load().then((loadedModel) => {
      this.model = loadedModel;
      console.log('loaded');
    });
    browser.mediaDevices.getUserMedia({video: true}).then((stream: any) => {
      this.video.srcObject = stream;
      this.video.play();
      const that = this;
      this.video.addEventListener('loadeddata', function(){that.predictWebcam();});
    });
  }
 
  predictWebcam(): any {
    this.model.detect(this.video).then(function (predictions) {
      // Remove any highlighting we did previous frame.
      for (let i = 0; i < this.children.length; i++) {
        this.liveView.removeChild(this.children[i]);
      }
      this.children.splice(0);
      
      // Now lets loop through predictions and draw them to the live view if
      // they have a high confidence score.
      for (let n = 0; n < predictions.length; n++) {
        // If we are over 66% sure we are sure we classified it right, draw it!
        if (predictions[n].score > 0.66) {
          const p = document.createElement('p');
          p.innerText = predictions[n].class  + ' - with ' 
              + Math.round(parseFloat(predictions[n].score) * 100) 
              + '% confidence.';
          p.setAttribute('style', 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
              + (predictions[n].bbox[1] - 10) + 'px; width: ' 
              + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;');
  
          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          highlighter.style.left = predictions[n].bbox[0] + 'px;';
          highlighter.style.top = predictions[n].bbox[1] + 'px;';
          highlighter.style.width = predictions[n].bbox[2] + 'px;';
          highlighter.style.height = predictions[n].bbox[3] + 'px;';
  
          this.liveView.appendChild(highlighter);
          this.liveView.appendChild(p);
          this.children.push(highlighter);
          this.children.push(p);
        }
      }
      
      // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(this.predictWebcam);
    });
  
  }

}

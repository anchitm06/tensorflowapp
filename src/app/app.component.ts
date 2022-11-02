import { Component, OnInit } from '@angular/core';
import * as cocoSsd from '../tensorflow-models/coco-ssd';
import * as tfjs from '@tensorflow/tfjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  video: HTMLVideoElement;
  title = 'tensorflowapp';
  liveView: any;
  children = [];
  model: cocoSsd.ObjectDetection

  constructor() {
    tfjs.setBackend('cpu');
  }
  ngOnInit() {
    this.video = document.getElementById('webcam') as HTMLVideoElement;
    this.liveView = document.getElementById('liveView');
    this.enableCam();
  }
  enableCam() {
    var browser = <any>navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    cocoSsd.load().then((loadedModel) => {
      this.model = loadedModel;
      browser.mediaDevices.getUserMedia({ video: true }).then((stream: any) => {
        this.video.srcObject = stream;
        this.video.play();
      });
    });
  }

  predictWebcam(): any {
    this.model.detect(this.video).then((predictions) => {
      // Remove any highlighting we did previous frame.
      if (this.children) {
        for (let i = 0; i < this.children.length; i++) {
          this.liveView.removeChild(this.children[i]);
        }
        this.children.splice(0);
      }

      // Now lets loop through predictions and draw them to the live view if
      // they have a high confidence score.
      for (let n = 0; n < predictions.length; n++) {
        // If we are over 66% sure we are sure we classified it right, draw it!
        if (predictions[n].score > 0.66) {
          const p = document.createElement('p');
          p.innerText = `${predictions[n].class} - with ${Math.round(parseFloat(`${predictions[n].score}`) * 100)}% confidence.`;
          p.setAttribute('style', 
          `margin-left: ${predictions[n].bbox[0]}px;
          margin-top: ${(predictions[n].bbox[1] - 10)}px;
          width: ${(predictions[n].bbox[2] - 10)}px;
          top: 0;
          left: 0;`
          );

          let highlighter = document.createElement('div');
          highlighter.setAttribute('style', 
          `width: ${predictions[n].bbox[2]}px;
          height: ${predictions[n].bbox[2]}px;
          top: ${predictions[n].bbox[1]}px;
          left: ${predictions[n].bbox[0]}px;
          background: rgba(0, 255, 0, 0.25);
          border: 1px dashed #ffffff;
          z-index: 1;
          position: absolute;`
          );

          this.liveView.appendChild(highlighter);
          this.liveView.appendChild(p);
          this.children.push(highlighter);
          this.children.push(p);
        }
      }

      // Call this function again to keep predicting when the browser is ready.
      window.requestAnimationFrame(() => { this.predictWebcam(); });
    });
  }
}

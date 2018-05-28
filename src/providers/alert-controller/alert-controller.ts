import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';

@Injectable()
export class AlertControllerProvider {

  constructor(public alertCtrl: AlertController) {
    console.log('Hello AlertControllerProvider Provider');
  }

  alertCtrlr(title: string, message: string, buttons: any) {
    let confirmAlert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      enableBackdropDismiss: false,
      buttons: buttons
    });
    confirmAlert.present();
  }

}

import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { ActivatePage } from '../activate/activate';

@Component({
  selector: 'page-view-rejected-message',
  templateUrl: 'view-rejected-message.html',
})
export class ViewRejectedMessagePage {

  public image: String;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController, ) {
    this.image = 'assets/imgs/logo.jpg';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewRejectedMessagePage');
    let alert = this.alertCtrl.create({
      title: 'Rejected',
      subTitle: 'Passenger rejected your hire rate.',
      enableBackdropDismiss: false,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.navCtrl.setRoot(ActivatePage);
          }
        }
      ]
    });
    alert.present();
  }

}

import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

import { ActivatePage } from '../activate/activate';

@Component({
  selector: 'page-view-rejected-message',
  templateUrl: 'view-rejected-message.html',
})
export class ViewRejectedMessagePage {

  public image: String;
  public hireNo: number;
  public host = 'http://www.my3wheel.lk/php/myHire';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public http: HttpClient ) {
    this.image = 'assets/imgs/logo.jpg';
    this.hireNo = navParams.get('hireNo');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewRejectedMessagePage');
    this.http.get(this.host + '/myHire_selectRejectedHire.php?hireNo=' + this.hireNo).subscribe(data => {
      console.log(data);
      let start = data['start'];
      let end = data['end'];
      let alert = this.alertCtrl.create({
        title: 'Rejected',
        subTitle: 'Passenger rejected your hire from ' + start + ' to ' + end,
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
    },
      (err) => {
        let message = "Network error! Please check your internet connection.";
        this.toaster(message);
      });
  }

  toaster(message) {
		let toast = this.toastCtrl.create({
			message: message,
			duration: 3000,
			position: 'bottom'
		});
		toast.present();
	}
}

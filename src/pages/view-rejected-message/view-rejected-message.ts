import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { ActivatePage } from '../activate/activate';
import { HttpServicesProvider } from '../../providers/http-services/http-services';
import { ToastControllerProvider } from '../../providers/toast-controller/toast-controller';

@Component({
  selector: 'page-view-rejected-message',
  templateUrl: 'view-rejected-message.html',
})
export class ViewRejectedMessagePage {

  public image: String;
  public hireNo: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
		public toastService: ToastControllerProvider,
    public service: HttpServicesProvider) {
    this.image = 'assets/imgs/logo.jpg';
    this.hireNo = navParams.get('hireNo');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewRejectedMessagePage');
    this.service.selectRejectedHire(this.hireNo).subscribe(data => {
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
        this.toastService.toastCtrlr(message);
      });
  }
}

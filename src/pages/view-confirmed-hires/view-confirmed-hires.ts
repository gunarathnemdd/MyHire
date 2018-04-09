import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { orderBy, filter } from 'lodash';
import moment from 'moment';

import { ActivatePage } from '../activate/activate';
import { SelectConfirmedHirePage } from '../select-confirmed-hire/select-confirmed-hire';

@Component({
  selector: 'page-view-confirmed-hires',
  templateUrl: 'view-confirmed-hires.html',
})
export class ViewConfirmedHiresPage {

  public image: string;
  public host = 'http://www.my3wheel.lk/php/myHire';
  public globalArray: any[] = [];
  public hire: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpClient,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController) {
    this.image = 'assets/imgs/logo.jpg';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewConfirmedHiresPage');
    this.storage.get('driverId').then((val) => {
      this.http.get(this.host + '/myHire_availableHire.php?driverId=' + val + '&confirm=yes&state=confirmed').subscribe(data => {
        console.log(data);
        if (data != null) {
          this.hire = data;
          this.hire = orderBy(this.hire, ['p_date', 'p_sortTime'], ['asc', 'asc']);
          this.hire = filter(this.hire, o => o.p_date >= moment().format('YYYY-MM-DD'));
          if (Object.keys(this.hire).length == 0) {
            this.hire = [{ p_fullName: "null" }];
          }
        }
        else {
          this.hire = [{ p_fullName: "null" }];
        }
        console.log(this.hire);
      },
        (err) => {
          let message = "Network error! Please check your internet connection.";
          this.toaster(message);
        });
    });
  }

  previousPage() {
    this.navCtrl.setRoot(ActivatePage);
  }

  showHire(item) {
    console.log(item);
    let profileModal = this.modalCtrl.create(SelectConfirmedHirePage, item);
    profileModal.present();
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

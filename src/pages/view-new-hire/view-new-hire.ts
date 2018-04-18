import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, NavParams, ModalController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { ActivatePage } from '../activate/activate';
import { ViewConfirmedHiresPage } from '../view-confirmed-hires/view-confirmed-hires';

@Component({
  selector: 'page-view-new-hire',
  templateUrl: 'view-new-hire.html',
})
export class ViewNewHirePage {

  public driverId: string;
  public image: string;
  public host = 'http://www.my3wheel.lk/php/myHire';
  public hire: any[] = [];
  public rate: number;
  public loading: any;
  public timeoutId: any;
  public hireNo: any;

  constructor(
    private formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    private storage: Storage,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
    this.image = 'assets/imgs/logo.jpg';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewNewHirePage');
    this.storage.get('driverId').then((val) => {
      this.http.get(this.host + '/myHire_availableHire.php?driverId=' + val + '&confirm=no&state=new').subscribe(data => {
        console.log(data);
        if ((data != null) && (Object.keys(data).length == 1)) {
          this.hireNo = data[0]['p_hireNo'];
          this.driverId = data[0]['p_driverID'];
          this.hire.push({ name: data[0]['p_fullName'], from: data[0]['p_journeyStart'], to: data[0]['p_journeyEnd'], date: data[0]['p_date'], time: data[0]['p_time'] });
        }
        else {
          this.hire.push({ name: "null" });
        }
        console.log(this.hire)
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

  confirmYes() {
    let alert = this.alertCtrl.create({
      title: 'Confirm',
      subTitle: 'If you want to confirm this hire, please enter your rate.',
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'rate',
          placeholder: 'Rate',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: data => {
            if (data.rate != "") {
              console.log(data.rate);
              this.http.get(this.host + '/myHire_confirmHire.php?hireNo=' + this.hireNo + '&driverId=' + this.driverId + '&rate=' + data.rate).subscribe(data => {
                console.log(data);
                this.storage.set('noOfNewHires', null);
                if (data["response"] == "confirmed") {
                  let message = "Please wait for the passenger's response";
                  this.toaster(message);
                  this.navCtrl.setRoot(ActivatePage);
                  // this.loading = this.loadingCtrl.create({
                  //   spinner: 'bubbles',
                  //   content: "Please wait for the passenger's response"
                  // });
                  // this.loading.present();
                  // this.isPassengerConfirmed(this.hireNo);

                  // this.http.get(this.host + '/myHire_updateDriverBalanceAfterHire.php?driverId=' + this.driverId).subscribe(data => {
                  //   let toast = this.toastCtrl.create({
                  //     message: 'Rs.5 Successfully Deduced from Your Account',
                  //     duration: 3000,
                  //     position: 'bottom'
                  //   });
                  //   toast.present();
                  //   this.navCtrl.setRoot(ActivatePage);
                  // });
                }
                else {
                  this.http.get(this.host + '/myHire_rejectHire.php?hireNo=' + this.hireNo + '&driverId=' + this.driverId).subscribe(data => {
                    console.log(data);
                    this.navCtrl.setRoot(ActivatePage);
                    let message = 'Network Error!';
                    this.toaster(message);
                  });
                }
              },
                (err) => {
                  let message = "Network error! Please check your internet connection.";
                  this.toaster(message);
                });
            }
            else {
              let message = 'This is a required field. Please only enter numbers.';
              this.toaster(message);
              return false;
            }
          }
        }
      ]
    });
    alert.present();
  }

  toaster(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  // isPassengerConfirmed(hireNo) {
  //   clearTimeout(this.timeoutId);
  //   this.http.get(this.host + '/myHire_isPassengerConfirmed.php?hireNo=' + hireNo).subscribe(data => {
  //     if (data["Passenger_Accept"] == "yes") {
  //       this.loading.dismiss();
  //       let alert = this.alertCtrl.create({
  //         title: 'Confirmed',
  //         subTitle: 'Passenger confirmed your hire rate.',
  //         buttons: [
  //           {
  //             text: 'OK',
  //             handler: data => {
  //               this.navCtrl.setRoot(ViewConfirmedHiresPage);
  //             }
  //           }
  //         ]
  //       });
  //       alert.present();
  //     }
  //     else if (data["Passenger_Accept"] == "reject") {
  //       this.loading.dismiss();
  //       let alert = this.alertCtrl.create({
  //         title: 'Rejected',
  //         subTitle: 'Passenger rejected your hire rate.',
  //         buttons: [
  //           {
  //             text: 'OK',
  //             handler: data => {
  //               this.navCtrl.setRoot(ActivatePage);
  //             }
  //           }
  //         ]
  //       });
  //       alert.present();
  //     }
  //     else if (data["Passenger_Accept"] == "error") {
  //       this.loading.dismiss();
  //       let alert = this.alertCtrl.create({
  //         title: 'Rejected',
  //         subTitle: 'Passenger rejected your hire rate.',
  //         buttons: [
  //           {
  //             text: 'OK',
  //             handler: data => {
  //               this.navCtrl.setRoot(ActivatePage);
  //             }
  //           }
  //         ]
  //       });
  //       alert.present();
  //     }
  //     else {
  //       this.timeoutId = setTimeout(() => {
  //         this.isPassengerConfirmed(hireNo);
  //       }, 10000);
  //     }
  //   },
  //     (err) => {
  //       let message = "Network error! Please check your internet connection.";
  //       this.toaster(message);
  //     });
  // }

  confirmNo() {
    let alert = this.alertCtrl.create({
      title: 'Delete',
      subTitle: 'Are you sure to cancel this hire?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: data => {
            this.http.get(this.host + '/myHire_rejectHire.php?hireNo=' + this.hireNo + '&driverId=' + this.driverId).subscribe(data => {
              console.log(data);
              this.storage.set('noOfNewHires', null);
              this.navCtrl.setRoot(ActivatePage);
            },
              (err) => {
                let message = "Network error! Please check your internet connection.";
                this.toaster(message);
              });
          }
        }
      ]
    });
    alert.present();
  }

}

import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { BackgroundMode } from '@ionic-native/background-mode';

import { ActivatePage } from '../activate/activate';
import { ViewConfirmedHiresPage } from '../view-confirmed-hires/view-confirmed-hires';
import { HttpServicesProvider } from '../../providers/http-services/http-services';

@Component({
  selector: 'page-view-new-hire',
  templateUrl: 'view-new-hire.html',
})
export class ViewNewHirePage {

  public driverId: string;
  public image: string;
  public hire: any[] = [];
  public rate: number;
  public loading: any;
  public timeoutId: any;
  public hireNo: any;
  public hireRate: any;
  public pushTimeOut: any;

  constructor(
    private formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: HttpServicesProvider,
    private storage: Storage,
    private backgroundMode: BackgroundMode,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController) {
    this.image = 'assets/imgs/logo.jpg';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewNewHirePage');
    this.storage.get('driverId').then((val) => {
      this.service.availableHire(val, 'no', 'new').subscribe(data => {
        console.log(data);
        if ((data != null) && (Object.keys(data).length == 1)) {
          this.hireNo = data[0]['p_hireNo'];
          this.driverId = data[0]['p_driverID'];
          console.log(data[0]['p_hireNo']);
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
              this.hireRate = data.rate;
              this.service.getBalance(this.driverId).subscribe(data => {
                if (data["balance"] != "error") {
                  let creditAmount = data["balance"];
                  let reduce = (this.hireRate * 5) / 100;
                  let balance = creditAmount - reduce;
                  if (balance < 0) {
                    this.balanceWarning(this.hireNo, this.driverId, this.hireRate);
                  }
                  else {
                    this.confirmHire(this.hireNo, this.driverId, this.hireRate);
                  }
                }
                else {
                  this.balanceWarning(this.hireNo, this.driverId, this.hireRate);
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

  balanceWarning(hireNo, driverId, hireRate) {
    let alert = this.alertCtrl.create({
      title: 'Insufficient Balance!',
      subTitle: 'Press OK button to take this hire and your balance get minus balance. To get another hire, you have to recharge your account. Otherwise press No to rejeact this hire.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'No',
          handler: data => {
            this.confirmNo();
          }
        },
        {
          text: 'OK',
          handler: data => {
            this.confirmHire(hireNo, driverId, hireRate);
          }
        }
      ]
    });
    alert.present();
  }

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
            this.rejectHire(this.hireNo, this.driverId, 'reject', 'Hire rejected successfully!');
          }
        }
      ]
    });
    alert.present();
  }

  confirmHire(hireNo, driverId, hireRate) {
    this.service.confirmHire(hireNo, driverId, hireRate).subscribe(data => {
      console.log(data);
      this.storage.set('noOfNewHires', null);
      if (data["response"] == "confirmed") {
        let message = "Please wait for the passenger's response";
        this.toaster(message);
        this.navCtrl.setRoot(ActivatePage, {
          backgroundMode: 'on'
        });
        this.deleteAfterTimeOut();
      }
      else if (data['response'] == 'already deleted') {
        this.storage.set('noOfNewHires', null);
        this.navCtrl.setRoot(ActivatePage);
        this.toaster("Hire is already deleted due to time out.");
      }
      else {
        this.rejectHire(hireNo, driverId, 'reject', 'Network error! Please check your internet connection.');
      }
    },
      (err) => {
        this.navCtrl.setRoot(ActivatePage);
        let message = "Network error! Please check your internet connection.";
        this.toaster(message);
      });
  }

  rejectHire(hireNo, driverId, state, message) {
    if (state == 'reject') {
      this.service.rejectHire(hireNo, driverId, state).subscribe(data => {
        console.log(data);
        if (data['response'] == 'deleted') {
          this.storage.set('noOfNewHires', null);
          this.navCtrl.setRoot(ActivatePage);
          this.toaster(message);
        }
        else if (data['response'] == 'already deleted') {
          this.storage.set('noOfNewHires', null);
          this.navCtrl.setRoot(ActivatePage);
          this.toaster("Hire is already deeted due to time out.");
        }
        else {
          this.navCtrl.setRoot(ActivatePage);
          let message2 = "Network error! Please check your internet connection.";
          this.toaster(message2);
        }
      },
        (err) => {
          let message2 = "Network error! Please check your internet connection.";
          this.toaster(message2);
        });
    }
    else {
      this.service.riderReject(hireNo, driverId, state).subscribe(data => {
        console.log(data);
        this.navCtrl.setRoot(ActivatePage);
      },
        (err) => {
          let message2 = "Network error! Please check your internet connection.";
          this.toaster(message2);
        });
    }
  }

  deleteAfterTimeOut() {
    console.log(this.hireNo);
    this.backgroundMode.enable();
    this.backgroundMode.moveToBackground();
    this.backgroundMode.on("activate").subscribe(() => {
      this.pushTimeOut = setTimeout(() => {
        this.service.deleteTimeOutHires(this.hireNo, 'passenger').subscribe(data => {
          console.log(data);
          if (data['responce'] != 'error') {
            clearTimeout(this.pushTimeOut);
            this.rejectHire(this.hireNo, this.driverId, 'delete', "Hire rejected! Passenger didn't responded your hire rate within 3 min.");
          }
          else {
            clearTimeout(this.pushTimeOut);
          }
        },
          (err) => {
            clearTimeout(this.pushTimeOut);
            let message = "Network error! Please check your internet connection.";
            this.toaster(message);
          });
      }, 60000);
    });
  }

}

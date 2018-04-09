import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { ActivatePage } from '../activate/activate';

@Component({
  selector: 'page-pay',
  templateUrl: 'pay.html',
})
export class PayPage {

  private recharge : FormGroup;
  public creditAmount: number;
  public image: String;
  public hiddenDiv: any;
  public pin: string;
  public driverId: string;
  public host = 'http://www.my3wheel.lk/php/myHire';

  constructor(
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public http: HttpClient,
    public navParams: NavParams,
    private storage: Storage,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController) {
      this.image = 'assets/imgs/logo.jpg';
      this.recharge = new FormGroup({
        pin: new FormControl('', Validators.compose([Validators.pattern('[0-9]*'), Validators.required]))
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PayPage');
    this.hiddenDiv = document.querySelector('#hidden');
    this.hiddenDiv.style.display = 'none';
    this.storage.get('driverId').then((val) => {
      this.driverId = val;
      this.http.get(this.host + '/myHire_getBalance.php?driverId=' + this.driverId).subscribe(data => {
        console.log(data["balance"]);
        if(data["balance"] != "error") {
          this.creditAmount = data["balance"];
        }
        else {
          this.creditAmount = 0;
        }
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

  pay() {
    this.hiddenDiv.style.display = 'block';
  }

  sendPin() {
    if(this.recharge["valid"]) {
      this.pin = this.recharge["value"]["pin"];
      this.http.get(this.host + '/myHire_updateDriverBalance.php?driverId=' + this.driverId + '&cardNo=' + this.pin).subscribe(data => {
        if(data["response"] == "success") {
          this.navCtrl.setRoot(ActivatePage);
          let message = "Your Payment is Successful. Now You Can Activate.";
          this.toaster(message);
        }
        else if(data["response"] == "invalid driverId") {
          let message = "Network Error!";
          this.toaster(message);
        }
        else if(data["response"] == "already used") {
          let message = "Recharge Card is Already Used. Please Try Another One.";
          this.toaster(message);
        }
        else if(data["response"] == "not valid") {
          let message = "Recharge Card is not a Valid Card. Please Try Another One and Contact Service Provider.";
          this.toaster(message);
        }
        else {
          let message = "Network Error!";
          this.toaster(message);
        }
        console.log(data["response"]);
      },
      (err) => {
        let message = "Network error! Please check your internet connection.";
        this.toaster(message);
      });
    }
    else {
      let message = "This is a required field. Please only enter numbers.";
      this.toaster(message);
    }
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

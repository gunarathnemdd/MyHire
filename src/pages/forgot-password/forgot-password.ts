import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SMS } from '@ionic-native/sms';

import { HomePage } from '../home/home';

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  private forgotPassword : FormGroup;
  public image: String;
  public message: string;
  public mobile: any;
  public host = 'http://www.my3wheel.lk/php/myHire';

  constructor(
    private formBuilder: FormBuilder,
    private sms: SMS,
    public navCtrl: NavController,
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public http: HttpClient) {
      this.image = 'assets/imgs/logo.jpg';
      this.forgotPassword = new FormGroup({
        mobile: new FormControl('', Validators.compose([Validators.minLength(9), Validators.maxLength(10), Validators.pattern('[0-9]*'), Validators.required]))
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgotPasswordPage');
  }

  previousPage() {
    this.navCtrl.setRoot(HomePage);
  }

  recover() {
    if(this.forgotPassword["valid"]) {
      this.mobile = this.forgotPassword["value"]["mobile"];
      this.http.get(this.host + '/myHire_forgotDriverId.php?phoneNo=' + this.mobile).subscribe(data => {
        if(data["response"] == "success") {
          this.sms.send(this.mobile, 'Your Driver ID for the MyHire account: ' + data["result"]);
          this.navCtrl.setRoot(HomePage);
          let message = "Driver ID is sent to " + this.mobile;
          this.toaster(message);
        }
        else if(data["response"] == "wrong tpNumber") {
          let message = "Wrong mobile number. Please try again!";
          this.toaster(message);
        }
      },
      (err) => {
        console.log(err);
        let message = "Network error. Please check your Internet connection!";
        this.toaster(message);
      });
    }
    else if(this.forgotPassword["controls"]["mobile"].hasError('required')) {
      let message = "This is a required field";
      this.toaster(message);
    }
    else {
      let message = "Please check your mobile number. It must be 10 digits or 9 digits without leading 0.";
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

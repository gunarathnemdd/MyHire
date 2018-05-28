import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { SMS } from '@ionic-native/sms';

import { HomePage } from '../home/home';
import { HttpServicesProvider } from '../../providers/http-services/http-services';
import { ToastControllerProvider } from '../../providers/toast-controller/toast-controller';

@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {

  private forgotPassword : FormGroup;
  public image: String;
  public message: string;
  public mobile: any;

  constructor(
    private formBuilder: FormBuilder,
    private sms: SMS,
    public navCtrl: NavController,
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
		public toastService: ToastControllerProvider,
    public service: HttpServicesProvider) {
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
      this.service.forgotDriverId(this.mobile).subscribe(data => {
        if(data["response"] == "success") {
          this.sms.send(this.mobile, 'Your Driver ID for the MyHire account: ' + data["result"]);
          this.navCtrl.setRoot(HomePage);
          let message = "Driver ID is sent to " + this.mobile;
          this.toastService.toastCtrlr(message);
        }
        else if(data["response"] == "wrong tpNumber") {
          let message = "Wrong mobile number. Please try again!";
          this.toastService.toastCtrlr(message);
        }
      },
      (err) => {
        console.log(err);
        let message = "Network error. Please check your Internet connection!";
        this.toastService.toastCtrlr(message);
      });
    }
    else if(this.forgotPassword["controls"]["mobile"].hasError('required')) {
      let message = "This is a required field";
      this.toastService.toastCtrlr(message);
    }
    else {
      let message = "Please check your mobile number. It must be 10 digits or 9 digits without leading 0.";
      this.toastService.toastCtrlr(message);
    }
  }

}

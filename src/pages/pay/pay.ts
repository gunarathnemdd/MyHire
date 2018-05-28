import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { ActivatePage } from '../activate/activate';
import { HttpServicesProvider } from '../../providers/http-services/http-services';
import { ToastControllerProvider } from '../../providers/toast-controller/toast-controller';

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

  constructor(
    private formBuilder: FormBuilder,
    public navCtrl: NavController,
    public service: HttpServicesProvider,
    public navParams: NavParams,
    private storage: Storage,
		public toastService: ToastControllerProvider,
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
      this.service.getBalance(this.driverId).subscribe(data => {
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
        this.toastService.toastCtrlr(message);
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
      this.service.updateDriverBalance(this.driverId, this.pin).subscribe(data => {
        if(data["response"] == "success") {
          this.navCtrl.setRoot(ActivatePage);
          let message = "Your Payment is Successful. Now You Can Activate.";
          this.toastService.toastCtrlr(message);
        }
        else if(data["response"] == "invalid driverId") {
          let message = "Network Error!";
          this.toastService.toastCtrlr(message);
        }
        else if(data["response"] == "already used") {
          let message = "Recharge Card is Already Used. Please Try Another One.";
          this.toastService.toastCtrlr(message);
        }
        else if(data["response"] == "not valid") {
          let message = "Recharge Card is not a Valid Card. Please Try Another One and Contact Service Provider.";
          this.toastService.toastCtrlr(message);
        }
        else {
          let message = "Network Error!";
          this.toastService.toastCtrlr(message);
        }
        console.log(data["response"]);
      },
      (err) => {
        let message = "Network error! Please check your internet connection.";
        this.toastService.toastCtrlr(message);
      });
    }
    else {
      let message = "This is a required field. Please only enter numbers.";
      this.toastService.toastCtrlr(message);
    }
  }

}

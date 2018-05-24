import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { ActivatePage } from '../activate/activate';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { ViewNewHirePage } from '../view-new-hire/view-new-hire';
import { ViewConfirmedHiresPage } from '../view-confirmed-hires/view-confirmed-hires';
import { ViewRejectedMessagePage } from '../view-rejected-message/view-rejected-message';
import { HttpServicesProvider } from '../../providers/http-services/http-services';
import { AlertControllerProvider } from '../../providers/alert-controller/alert-controller';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private login: FormGroup;
  public driverId: string;
  public driverIdStorage: string;
  public tempID: string;
  public image: String;
  public errmsg = '';

  constructor(
    public platform: Platform,
    public splashScreen: SplashScreen,
    public navCtrl: NavController,
    public service: HttpServicesProvider,
    private storage: Storage,
    private push: Push,
    public localNotifications: LocalNotifications,
    public alertService: AlertControllerProvider) {
    this.image = 'assets/imgs/logo.jpg';
    this.login = new FormGroup({
      driverId: new FormControl('', Validators.compose([Validators.pattern('[a-zA-Z0-9 ]*'), Validators.required]))
    });
  }

  ionViewDidLoad() {
    this.storage.get('driverId').then((val) => {
      this.splashScreen.hide();
      this.driverIdStorage = val;
      console.log('Your ID is: ', val);
      if (this.driverIdStorage != null) {
        this.navCtrl.setRoot(ActivatePage);
      }
    });
  }

  logForm() {
    if (this.login["valid"]) {
      this.driverId = this.login["value"]["driverId"].replace(/\s/g, '');
      this.service.login(this.driverId).subscribe(data => {
        this.tempID = data["driverId"];
        if (data["driverId"] != "SL00") {
          this.initPushNotification(data["driverId"]);
          this.storage.set('driverId', data["driverId"]).then(data => {
            this.navCtrl.setRoot(ActivatePage);
          });
          let title = "Hello " + data["displayName"];
          let message = "Welcome again";
          let buttons = [{ text: 'OK', role: 'cancel' }];
          this.alertService.alertCtrlr(title, message, buttons);
        }
        else {
          let title = "Sorry!";
          let message = "Please Check your Driver ID or signup to this service!";
          let buttons = [{ text: 'OK', role: 'cancel' }];
          this.alertService.alertCtrlr(title, message, buttons);
        }
      },
        (err) => {
          console.log(err);
          let title = "Sorry!";
          let message = "Please check your Internet connection!";
          let buttons = [{ text: 'OK', role: 'cancel' }];
          this.alertService.alertCtrlr(title, message, buttons);
        });
    }
    else if (this.login["controls"]["driverId"].hasError('required')) {
      let title = "Sorry!";
      let message = "This is a required field.";
      let buttons = [{ text: 'OK', role: 'cancel' }];
      this.alertService.alertCtrlr(title, message, buttons);
    }
    else {
      let title = "Sorry!";
      let message = "Only use letters, numbers and space. Don't use other characters.";
      let buttons = [{ text: 'OK', role: 'cancel' }];
      this.alertService.alertCtrlr(title, message, buttons);
    }
  }

  forgetId() {
    console.log('forget driver id');
    this.navCtrl.push(ForgotPasswordPage);
  }

  initPushNotification(driverId) {
    if (!this.platform.is('cordova')) {
      console.log('Push notifications not initialized. Cordova is not available - Run in physical device');
      return;
    }
    const options: PushOptions = {
      android: {
        senderID: '693145121166'
      },
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);

    pushObject.on('registration').subscribe((data: any) => {
      console.log('device token -> ' + data.registrationId);
      this.service.updateDeviceToken(driverId, data.registrationId).subscribe(data => {
        console.log(data);
      });
    });

    pushObject.on('error').subscribe(error => console.log(error));
  }

}

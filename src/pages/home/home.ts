import { Component } from '@angular/core';
import { Platform, NavController, ModalController, ToastController, AlertController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { ActivatePage } from '../activate/activate';
import { ForgotPasswordPage } from '../forgot-password/forgot-password';
import { ViewNewHirePage } from '../view-new-hire/view-new-hire';
import { ViewConfirmedHiresPage } from '../view-confirmed-hires/view-confirmed-hires';
import { ViewRejectedMessagePage } from '../view-rejected-message/view-rejected-message';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private login : FormGroup;
  public driverId: string;
  public driverIdStorage: string;
  public tempID: string;
  public image: String;
  public errmsg = '';
  public host = 'http://www.my3wheel.lk/php/myHire';

  constructor(
    public platform: Platform,
    public splashScreen: SplashScreen,
    public navCtrl: NavController,
    public http: HttpClient,
    private storage: Storage,
    private push: Push,
    public localNotifications: LocalNotifications,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController) {
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
      if(this.driverIdStorage != null) {
        this.navCtrl.setRoot(ActivatePage);
      }
    });
  }

  logForm() {
    if(this.login["valid"]) {
      this.driverId = this.login["value"]["driverId"].replace(/\s/g,'');
      this.http.get(this.host + '/myHire_login.php?driverId=' + this.driverId).subscribe(data => {
          this.tempID = data["driverId"];
          if(data["driverId"] != "SL00") {
            this.initPushNotification(data["driverId"]);
            this.storage.set('driverId', data["driverId"]).then(data => {
              this.navCtrl.setRoot(ActivatePage);
            });
            let title = "Hello " + data["displayName"];
            let message = "Welcome again";
            this.alert(title, message);
          }
          else {
            let title = "Sorry!";
            let message = "Please Check your Driver ID or signup to this service!";
            this.alert(title, message);
          }
      },
      (err) => {
        console.log(err);
        let title = "Sorry!";
        let message = "Please check your Internet connection!";
        this.alert(title, message);
      });
    }
    else if(this.login["controls"]["driverId"].hasError('required')) {
      let title = "Sorry!";
      let message = "This is a required field.";
      this.alert(title, message);
    }
    else {
      let title = "Sorry!";
      let message = "Only use letters, numbers and space. Don't use other characters.";
      this.alert(title, message);
    }
  }

  alert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      enableBackdropDismiss: false,
      buttons: ['OK']
    });
    alert.present();
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
        senderID: '326433778451'
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
      this.http.get(this.host + '/myHire_updateDeviceToken.php?driverId=' + driverId + '&token=' + data.registrationId).subscribe(data => {
        console.log(data);
      });
      //TODO - send device token to server
    });

    pushObject.on('notification').subscribe((data: any) => {
      console.log('data -> ' + data);
      //if user using app and push notification comes
      if (data.additionalData.foreground) {
        // if application open, show popup
        let confirmAlert = this.alertCtrl.create({
          title: data.title,
          message: data.message,
          enableBackdropDismiss: false,
          buttons: [{
            text: 'View',
            handler: () => {
              //TODO: Your logic here
              if(data.title == "New Hire") {
								this.navCtrl.push(ViewNewHirePage);
							}
							else if(data.title == "Hire Confirmed") {
								this.navCtrl.push(ViewConfirmedHiresPage);
              }
              else if(data.title == "Hire Rejected") {
								this.navCtrl.push(ViewRejectedMessagePage);
							}
              this.showNotification(data.message);
            }
          }]
        });
        confirmAlert.present();
      } else {
        //if user NOT using app and push notification comes
        //TODO: Your logic on click of push notification directly
        if(data.title == "New Hire") {
          this.navCtrl.push(ViewNewHirePage);
        }
        else if(data.title == "Hire Confirmed") {
          this.navCtrl.push(ViewConfirmedHiresPage);
        }
        else if(data.title == "Hire Rejected") {
          this.navCtrl.push(ViewRejectedMessagePage);
        }
        this.showNotification(data.message);
        console.log('Push notification clicked');
      }
    });

    pushObject.on('error').subscribe(error => console.log(error)); //this.notification(error)
  }

  showNotification(message) {
    this.localNotifications.schedule({
      text: message
    });
  }

}

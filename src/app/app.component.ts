import { Component } from '@angular/core';
import { App, Platform, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/filter';
import moment from 'moment';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundMode } from '@ionic-native/background-mode';

import { HomePage } from '../pages/home/home';
import { ActivatePage } from '../pages/activate/activate';
import { HttpServicesProvider } from '../providers/http-services/http-services';
import { AlertControllerProvider } from '../providers/alert-controller/alert-controller';
import { ToastControllerProvider } from '../providers/toast-controller/toast-controller';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  public driverId: string;
  public lastUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');

  public lastBack: any = Date.now();
  public allowClose: boolean = false;
  public translate: any;

  constructor(
    public platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public app: App,
    public toastCtrl: ToastController,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
    public service: HttpServicesProvider,
    public localNotifications: LocalNotifications,
    public toastService: ToastControllerProvider,
    private push: Push,
    private backgroundMode: BackgroundMode,
    private storage: Storage,
    public alertService: AlertControllerProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      console.log('old version');

      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if (canRequest) {
          // the accuracy option will be ignored by iOS
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
            () => console.log('Request successful'),
            error => console.log('Error requesting location permissions', error)
          );
        }
      });

      let onSuccess = (position) => {
        this.storage.get('driverId').then((val) => {
          this.driverId = val;
          if (position.coords !== undefined) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            let minFrequency = 10 * 1000;
            let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
            let ms = moment(timestamp, "YYYY-MM-DD HH:mm:ss").diff(moment(this.lastUpdateTime, "YYYY-MM-DD HH:mm:ss"));
            if (ms >= minFrequency) {
              this.lastUpdateTime = timestamp;
              this.service.setDriverLocation(this.driverId, latitude, longitude, timestamp, 'yes').subscribe(data => {
                console.log(data);
                this.storage.set('isLocationOn', 'yes').then(data => {
                  this.storage.get('isLocationOn').then((val) => {
                    console.log('isLocationOn: ', val);
                  });
                });
              });
            }
          }
        });
      }

      let onError = (error) => {
        console.log(error);
        if (error.code == 1) {
          let minFrequency = 10 * 1000;
          let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
          let ms = moment(timestamp, "YYYY-MM-DD HH:mm:ss").diff(moment(this.lastUpdateTime, "YYYY-MM-DD HH:mm:ss"));
          if (ms >= minFrequency) {
            this.lastUpdateTime = timestamp;
            this.service.setDriverLocation(this.driverId, 0, 0, timestamp, 'no').subscribe(data => {
              console.log(data);
              this.storage.set('isLocationOn', 'no').then(data => {
                this.storage.get('isLocationOn').then((val) => {
                  console.log('isLocationOn: ', val);
                });
              });
            });
            let title = "Confirm";
            let message = "Please turn on your device location to visible your vehicle to passengers";
            let buttons = [{ text: 'OK', role: 'cancel' }];
            this.alertService.alertCtrlr(title, message, buttons);
          }
        }
      }

      let options = {
        enableHighAccuracy: true,
      }

      navigator.geolocation.watchPosition(onSuccess, onError, options);

      platform.registerBackButtonAction(() => {
        const overlay = this.app._appRoot._overlayPortal._views[0];//getActive();
        const nav = app.getActiveNavs()[0];
        const activeView = nav.getActive();
        const closeDelay = 2000;
        const spamDelay = 500;
        if ((activeView.name === "ActivatePage") || (activeView.name === "HomePage")) {
          if (overlay && overlay.dismiss) {
            overlay.dismiss();
          } else if (nav.canGoBack()) {
            nav.pop();
          } else if (Date.now() - this.lastBack > spamDelay && !this.allowClose) {
            this.allowClose = true;
            let toast = this.toastCtrl.create({
              message: "Press BACK again to exit",
              duration: closeDelay,
              dismissOnPageChange: true
            });
            toast.onDidDismiss(() => {
              this.allowClose = false;
            });
            toast.present();
          } else if (Date.now() - this.lastBack < closeDelay && this.allowClose) {
            //platform.exitApp();
            this.backgroundMode.enable();
            this.backgroundMode.moveToBackground();
          }
          this.lastBack = Date.now();
        }
      });
    });
  }
}


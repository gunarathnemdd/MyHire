import { Component } from '@angular/core';
import { App, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { HttpClient } from '@angular/common/http';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/filter';
import moment from 'moment';
import { Geolocation } from '@ionic-native/geolocation';
import { BackgroundMode } from '@ionic-native/background-mode';

import { HomePage } from '../pages/home/home';
import { ActivatePage } from '../pages/activate/activate';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = HomePage;

  public driverId: string;
  public host = 'http://www.my3wheel.lk/php/myHire';
  public lastUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');

  constructor(
    public platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public app: App,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
    public http: HttpClient,
    public localNotifications: LocalNotifications,
    private push: Push,
		private backgroundMode: BackgroundMode,
    private storage: Storage,
    public alertCtrl: AlertController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

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
              this.http.get(this.host + '/myHire_setDriverLocation.php?driverId=' + this.driverId + '&latitude=' + latitude + '&longitude=' + longitude + '&timestamp=' + timestamp + '&isLocationOn=yes').subscribe(data => {
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
            this.http.get(this.host + '/myHire_setDriverLocation.php?driverId=' + this.driverId + '&latitude=0&longitude=0&timestamp=' + timestamp + '&isLocationOn=no').subscribe(data => {
              console.log(data);
              this.storage.set('isLocationOn', 'no').then(data => {
                this.storage.get('isLocationOn').then((val) => {
                  console.log('isLocationOn: ', val);
                });
              });
            });
            let alert = this.alertCtrl.create({
              title: 'Confirm',
              subTitle: 'Please turn on your device location to visible your vehicle to passengers',
              buttons: [
                {
                  text: 'OK',
                  role: 'cancel'
                }
              ]
            });
            alert.present();
          }
        }
      }

      let options = {
        enableHighAccuracy: true,
      }

      navigator.geolocation.watchPosition(onSuccess, onError, options);

      platform.registerBackButtonAction(() => {

        let nav = app.getActiveNavs()[0];
        let activeView = nav.getActive();

        if ((activeView.name === "ActivatePage") || (activeView.name === "HomePage")) {

          if (nav.canGoBack()) { //Can we go back?
            nav.pop();
          } else {
            const alert = this.alertCtrl.create({
              title: 'App Termination',
              subTitle: 'Do you really want to close the app?',
              buttons: [{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                  console.log('Application exit prevented!');
                }
              }, {
                text: 'Close App',
                handler: () => {
                  //platform.exitApp(); // Close this application
                  this.backgroundMode.enable();
                  this.backgroundMode.moveToBackground();
                }
              }]
            });
            alert.present();
          }
        }
        else {
          nav.pop();
        }
      });
    });
  }
}


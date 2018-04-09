import { Component } from '@angular/core';
import { Platform, AlertController } from 'ionic-angular';
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

import { HomePage } from '../pages/home/home';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  public driverId: string;
  public host = 'http://www.my3wheel.lk/php/myHire';
  public lastUpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');

  constructor(
    public platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen,
    private locationAccuracy: LocationAccuracy,
    private geolocation: Geolocation,
    public http: HttpClient,
    public localNotifications: LocalNotifications,
    private push: Push,
    private storage: Storage,
    public alertCtrl: AlertController) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      
      this.initPushNotification();
      
      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if(canRequest) {
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
    });
  }

  initPushNotification() {
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

    pushObject.on('notification').subscribe((data: any) => {
      console.log('data -> ' + data);
      //if user using app and push notification comes
      if (data.additionalData.foreground) {
        // if application open, show popup
        let confirmAlert = this.alertCtrl.create({
          title: data.title,
          message: data.message,
          buttons: [{
            text: 'Ignore',
            role: 'cancel'
          }, {
            text: 'View',
            handler: () => {
              //TODO: Your logic here
              this.showNotification(data.message);
            }
          }]
        });
        confirmAlert.present();
      } else {
        //if user NOT using app and push notification comes
        //TODO: Your logic on click of push notification directly
        this.showNotification(data.message);
        console.log('Push notification clicked');
      }
    });

    pushObject.on('error').subscribe(error => console.log(error));
  }

  showNotification(message) {
    this.localNotifications.schedule({
      text: message
    });
  }
}


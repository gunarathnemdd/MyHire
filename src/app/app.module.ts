import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SMS } from '@ionic-native/sms';
import { Insomnia } from '@ionic-native/insomnia';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ActivatePage } from '../pages/activate/activate';
import { PayPage } from '../pages/pay/pay';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { ViewNewHirePage } from '../pages/view-new-hire/view-new-hire';
import { SelectConfirmedHirePage } from '../pages/select-confirmed-hire/select-confirmed-hire';
import { ViewConfirmedHiresPage } from '../pages/view-confirmed-hires/view-confirmed-hires';
import { ViewRejectedMessagePage } from '../pages/view-rejected-message/view-rejected-message';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ActivatePage,
    PayPage,
    ForgotPasswordPage,
    ViewNewHirePage,
    SelectConfirmedHirePage,
    ViewConfirmedHiresPage,
    ViewRejectedMessagePage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ActivatePage,
    PayPage,
    ForgotPasswordPage,
    ViewNewHirePage,
    SelectConfirmedHirePage,
    ViewConfirmedHiresPage,
    ViewRejectedMessagePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeAudio,
    Vibration,
    LocalNotifications,
    SMS,
    Insomnia,
    LocationAccuracy,
    Push,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}

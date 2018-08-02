import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';

import { ViewConfirmedHiresPage } from '../view-confirmed-hires/view-confirmed-hires';

@Component({
  selector: 'page-select-confirmed-hire',
  templateUrl: 'select-confirmed-hire.html',
})
export class SelectConfirmedHirePage {

  public image: string;
  public name: string;
  public mobile: string;
  public from: string;
  public to: string;
  public time: any;
  public date: any;
  public customerId: any;
  public hireRate: number;

  constructor(
    private callNumber: CallNumber,
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController) {
      this.image = 'assets/imgs/logo.png';
      this.name = navParams.get('p_fullName');
      this.mobile = navParams.get('p_tpNumber');
      this.from = navParams.get('p_journeyStart');
      this.to = navParams.get('p_journeyEnd');
      this.time = navParams.get('p_time');
      this.date = navParams.get('p_date');
      this.customerId = navParams.get('p_tpNumber');
      this.hireRate = navParams.get('p_hireRate');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SelectConfirmedHirePage');
  }

  previousPage() {
    //this.navCtrl.push(ViewConfirmedHiresPage);
    this.viewCtrl.dismiss();
  }

  closeModal(){
    console.log('closed');
    this.navCtrl.push(ViewConfirmedHiresPage);
    //this.viewCtrl.dismiss();
  }

  getCall() {
    this.callNumber.callNumber(this.mobile, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

}

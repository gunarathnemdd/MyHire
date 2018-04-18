import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

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
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public http: HttpClient) {
      this.image = 'assets/imgs/logo.jpg';
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

}

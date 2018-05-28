import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpServicesProvider {

  public host = 'http://www.my3wheel.lk/php/myHire';
  public host2 = 'http://www.my3wheel.lk/php/my3Wheel';
  public host3 = 'http://www.my3wheel.lk/php/common';

  constructor(public http: HttpClient) {
    console.log('Hello HttpServicesProvider Provider');
  }

  versionCompare(appName) {
    return this.http.get(this.host3 + '/common_versionCompare.php?appName=' + appName);
  }

  login(driverId) {
    return this.http.get(this.host + '/myHire_login.php?driverId=' + driverId);
  }

  updateDeviceToken(driverId, registrationId) {
    return this.http.get(this.host + '/myHire_updateDeviceToken.php?driverId=' + driverId + '&token=' + registrationId);
  }

  forgotDriverId(mobile) {
    return this.http.get(this.host + '/myHire_forgotDriverId.php?phoneNo=' + mobile);
  }

  getBalance(driverId) {
    return this.http.get(this.host + '/myHire_getBalance.php?driverId=' + driverId);
  }

  updateDriverBalance(driverId, pin) {
    return this.http.get(this.host + '/myHire_updateDriverBalance.php?driverId=' + driverId + '&cardNo=' + pin);
  }

  availableHire(driverId, confirmState, state) {
    return this.http.get(this.host + '/myHire_availableHire.php?driverId=' + driverId + '&confirm=' + confirmState + '&state=' + state);
  }

  setDriverLocation(driverId, latitude, longitude, timestamp, state) {
    return this.http.get(this.host + '/myHire_setDriverLocation.php?driverId=' + driverId + '&latitude=' + latitude + '&longitude=' + longitude + '&timestamp=' + timestamp + '&isLocationOn=' + state);
  }

  confirmHire(hireNo, driverId, hireRate) {
    return this.http.get(this.host + '/myHire_confirmHire.php?hireNo=' + hireNo + '&driverId=' + driverId + '&rate=' + hireRate);
  }

  rejectHire(hireNo, driverId, state) {
    return this.http.get(this.host + '/myHire_rejectHire.php?hireNo=' + hireNo + '&driverId=' + driverId + '&state=' + state);
  }

  riderReject(hireNo, driverId, state) {
    return this.http.get(this.host2 + '/my3Wheel_riderReject.php?hireNo=' + hireNo + '&driverId=' + driverId + '&state=' + state);
  }

  deleteTimeOutHires(hireNo, state) {
    return this.http.get(this.host + '/myHire_deleteTimeOutHires.php?hireNo=' + hireNo + '&state=' + state);
  }

  selectRejectedHire(hireNo) {
    return this.http.get(this.host + '/myHire_selectRejectedHire.php?hireNo=' + hireNo);
  }

  checkActiveHireAvailability(driverId) {
    return this.http.get(this.host + '/myHire_checkActiveHireAvailability.php?driverId=' + driverId);
  }

  isDriverAvailable(driverId) {
    return this.http.get(this.host + '/myHire_isDriverAvailable.php?driverId=' + driverId);
  }

  driverAvailability(driverId, state) {
    return this.http.get(this.host + '/myHire_driverAvailability.php?driverId=' + driverId + '&available=' + state);
  }

  sendPassengerRemind(hireNo) {
    return this.http.get(this.host + '/myHire_sendPassengerRemind.php?hireNo=' + hireNo);
  }

}

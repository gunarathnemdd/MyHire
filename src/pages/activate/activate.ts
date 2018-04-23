import { Component } from '@angular/core';
import { Platform, NavController, NavParams, ModalController, ToastController, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { NativeAudio } from '@ionic-native/native-audio';
import { Vibration } from '@ionic-native/vibration';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Insomnia } from '@ionic-native/insomnia';
import { orderBy, filter } from 'lodash';
import moment from 'moment';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { PayPage } from '../pay/pay';
import { ViewNewHirePage } from '../view-new-hire/view-new-hire';
import { ViewConfirmedHiresPage } from '../view-confirmed-hires/view-confirmed-hires';
import { ViewRejectedMessagePage } from '../view-rejected-message/view-rejected-message';

@Component({
	selector: 'page-activate',
	templateUrl: 'activate.html',
})
export class ActivatePage {

	public image: string;
	public driverIdStorage: string;
	public isLocationOn: string;
	public host = 'http://www.my3wheel.lk/php/myHire';
	public noOfNewHires: number;
	public noOfConfirmedHires: number;
	public activeState: any;
	public isActive: any;
	public actionIcon: any;
	public stateIcon: any;
	public state: number;
	public count: number = 17;
	public timeOut: any;
	public isNotified: boolean = false;
	public intervalId: any;
	public data: any;

	constructor(
		public platform: Platform,
		public navCtrl: NavController,
		public navParams: NavParams,
		public http: HttpClient,
		private storage: Storage,
		private nativeAudio: NativeAudio,
		private vibration: Vibration,
		private push: Push,
		private localNotifications: LocalNotifications,
		public toastCtrl: ToastController,
		public modalCtrl: ModalController,
		public alertCtrl: AlertController,
		private insomnia: Insomnia) {
		this.image = 'assets/imgs/logo.jpg';
		this.activeState = "ACTIVATE";
		this.actionIcon = "ios-eye";
		this.isActive = "Deactive";
		this.stateIcon = "close";
		this.nativeAudio.preloadComplex('newHire', 'assets/media/alert.MP3', 1, 1, 0);
		this.initPushNotification();
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ActivatePage');
		this.insomnia.keepAwake().then(
			() =>
				this.storage.forEach((value, key, index) => {
					if (key == "driverId") { this.driverIdStorage = value; }
					else if (key == "intervalID") { this.intervalId = value; }
					else if (key == "noOfNewHires") { this.noOfNewHires = value; }
					else if (key == "isNotified") { this.isNotified = value; }
				}).then(() => {
					clearInterval(this.intervalId);
					console.log('driverId: ', this.driverIdStorage);
					this.getNewHire();
					this.getConfirmedHires();
					this.getActiveState();
				}),
			() => {
				this.fallAsleep();
			}
		)
	}

	fallAsleep() {
		this.insomnia.allowSleepAgain();
	}

	getNewHire() {
		this.http.get(this.host + '/myHire_availableHire.php?driverId=' + this.driverIdStorage + '&confirm=no&state=new').subscribe(data => {
			console.log(data);
			if ((data != null) && (Object.keys(data).length == 1)) {
				this.noOfNewHires = 1;
				this.storage.set('noOfNewHires', this.noOfNewHires);
				this.nativeAudio.play('newHire');
				console.log('vibrate');
				this.vibration.vibrate([500, 500, 500, 1000, 500, 500, 500]);
				if (!this.isNotified) {
					this.isNotified = true;
					this.storage.set('isNotified', true);
					this.deactive();
					//this.getNotification();
				}
			}
			else {
				this.nativeAudio.stop('newHire');
				this.vibration.vibrate(0);
				if (this.isNotified) {
					this.isNotified = false;
					this.noOfNewHires = null;
					console.log(this.noOfNewHires);
					this.storage.set('isNotified', false);
					this.storage.set('noOfNewHires', this.noOfNewHires);
					this.active();
				}
			}
		},
			(err) => {
				let message = "Network error! Please check your internet connection.";
				this.toaster(message);
			});
	}

	// getNotification() {
	// 	this.localNotifications.schedule({
	// 		id: 1,
	// 		text: 'You Have an New Hire',
	// 	});
	// }

	getConfirmedHires() {
		this.http.get(this.host + '/myHire_availableHire.php?driverId=' + this.driverIdStorage + '&confirm=yes&state=confirmed').subscribe(data => {
			if ((data != null) && (data != '0')) {
				let hire = data;
				hire = filter(hire, o => o.p_date >= moment().format('YYYY-MM-DD'));
				this.noOfConfirmedHires = Object.keys(hire).length;
				if (this.noOfConfirmedHires == 0) {
					this.noOfConfirmedHires = null;
				}
			}
		});
	}

	getActiveState() {
		this.http.get(this.host + '/myHire_getBalance.php?driverId=' + this.driverIdStorage).subscribe(data => {
			if ((data["balance"] != "error") && (data["balance"] != 0)) {
				console.log(data["balance"]);
				this.http.get(this.host + '/myHire_isDriverAvailable.php?driverId=' + this.driverIdStorage).subscribe(data => {
					// set a key/value
					this.storage.set('driverAvailabiity', data["availability"]).then(data => {
						this.storage.get('driverAvailabiity').then((val) => {
							console.log(val);
							if (val == 'yes') {
								console.log('active');
								this.activeState = "DEACTIVATE";
								this.actionIcon = "ios-eye-off";
								this.isActive = "Active";
								this.stateIcon = "checkmark";
								this.state = 1;
								let message = "You are Activated.";
								this.toaster(message);
							}
							else {
								console.log('deactive');
								this.activeState = "ACTIVATE";
								this.actionIcon = "ios-eye";
								this.isActive = "Deactive";
								this.stateIcon = "close";
								this.state = 0;
								let message = "Deactivated. Please Activate to Receive Hires.";
								this.toaster(message);
							}
						});
					});
					this.storage.set('errorMassege', 'Please wait..');
				},
					(err) => {
						let message = "Network error!";
						this.toaster(message);
					});
			}
			else {
				this.deactive();
			}
		});
	}

	playAudio() {
		this.timeOut = setTimeout(() => {
			if (--this.count) {
				console.log(this.count);
				this.playAudio();
				this.nativeAudio.play('newHire');
			}
		}, 10000);
		this.storage.set('intervalId', this.timeOut);
	}

	activeStateChange() {
		if (this.state == 1) {
			this.deactive();
		}
		else {
			this.active();
		}
	}

	active() {
		this.http.get(this.host + '/myHire_checkActiveHireAvailability.php?driverId=' + this.driverIdStorage).subscribe(data => {
			this.data = data;
			this.http.get(this.host + '/myHire_getBalance.php?driverId=' + this.driverIdStorage).subscribe(data => {
				if ((data["balance"] != "error") && (data["balance"] != 0) && (this.data["response"] == "can activate")) {
					this.http.get(this.host + '/myHire_driverAvailability.php?driverId=' + this.driverIdStorage + '&available=yes').subscribe(data => {
						// set a key/value
						this.storage.set('driverAvailabiity', data["availability"]).then(data => {
							this.storage.get('driverAvailabiity').then((val) => {
								console.log('is set: ', val);
							});
						});
						this.activeState = "DEACTIVATE";
						this.actionIcon = "ios-eye-off";
						this.isActive = "Active";
						this.stateIcon = "checkmark";
						this.state = 1;
						let message = "You are Activated.";
						this.toaster(message);
					},
						(err) => {
							let message = "Network error!";
							this.toaster(message);
						});
				}
				else if (this.data["response"] == "driver didn't accepted") {
					let title = "You Have an Active Hire!";
					let message = "Please accept or reject your new hire first to activate your account.";
					this.alert(title, message);
				}
				else if (this.data["response"] == "passenger didn't accepted") {
					let title = "You Have an Active Hire!";
					let message = "Please wait while passenger accept or reject your hire rate to activate your account.";
					this.alert(title, message);
				}
				else {
					let title = "Insufficient Balance!";
					let message = "Please recharge to activate your account.";
					this.alert(title, message);
				}
			},
				(err) => {
					let message = "Network error! Please check your internet connection.";
					this.toaster(message);
				});
		});

	}

	deactive() {
		console.log("deactive");
		this.http.get(this.host + '/myHire_driverAvailability.php?driverId=' + this.driverIdStorage + '&available=no').subscribe(data => {
			// set a key/value
			this.storage.set('driverAvailabiity', data["availability"]).then(data => {
				this.storage.get('driverAvailabiity').then((val) => {
					console.log('is set: ', val);
				});
			});
			this.activeState = "ACTIVATE";
			this.actionIcon = "ios-eye";
			this.isActive = "Deactive";
			this.stateIcon = "close";
			this.state = 0;
			let message = "Deactivated. Please Activate to Receive Hires.";
			this.toaster(message);
		},
			(err) => {
				let message = "Network error! Please check your internet connection.";
				this.toaster(message);
			});
	}

	newHire() {
		console.log("newHire");
		this.http.get(this.host + '/myHire_availableHire.php?driverId=' + this.driverIdStorage + '&confirm=no&state=new').subscribe(data => {
			if ((data != null) && (Object.keys(data).length == 1)) {
				this.navCtrl.push(ViewNewHirePage);
			}
			else {
				let title = "No New Hires!";
				let message = "You don't have a new hire at this moment.";
				this.alert(title, message);
			}
		},
			(err) => {
				let message = "Network error! Please check your internet connection.";
				this.toaster(message);
			});
	}

	confirmedHire() {
		console.log("confirmedHire");
		this.http.get(this.host + '/myHire_availableHire.php?driverId=' + this.driverIdStorage + '&confirm=yes&state=confirmed').subscribe(data => {
			if (this.noOfConfirmedHires > 0) { //((data != null) && (data != '0')) {
				this.navCtrl.push(ViewConfirmedHiresPage);
			}
			else {
				let title = "No Confirmed Hires!";
				let message = "You don't have any confirmed hires at this moment.";
				this.alert(title, message);
			}
		},
			(err) => {
				let message = "Network error! Please check your internet connection.";
				this.toaster(message);
			});
	}

	pay() {
		console.log("pay");
		this.navCtrl.push(PayPage);
	}

	toaster(message) {
		let toast = this.toastCtrl.create({
			message: message,
			duration: 3000,
			position: 'bottom'
		});
		toast.present();
	}

	alert(title, message) {
		let alert = this.alertCtrl.create({
			title: title,
			subTitle: message,
			enableBackdropDismiss: false,
			buttons: [
				{
					text: 'OK',
					role: 'cancel'
				}
			]
		});
		alert.present();
	}

	initPushNotification() {
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

		pushObject.on('notification').subscribe((data: any) => {
			console.log('data -> ', data);
			//if user using app and push notification comes
			if (data.additionalData.foreground) {
				// if application open, show popup
				let confirmAlert = this.alertCtrl.create({
					title: data.title,
					subTitle: data.message,
					buttons: [{
						text: 'View',
						handler: () => {
							//TODO: Your logic here
							if (data.title == "New Hire") {
								this.navCtrl.push(ViewNewHirePage);
							}
							else if (data.title == "Hire Confirmed") {
								this.navCtrl.push(ViewConfirmedHiresPage);
								this.sendDriverDetailsToPassenger(data.additionalData['subtitle']);
							}
							else if (data.title == "Hire Rejected") {
								this.navCtrl.push(ViewRejectedMessagePage, {
									hireNo: data.additionalData['subtitle']
								});
							}
						}
					}]
				});
				confirmAlert.present();
			} else {
				//if user NOT using app and push notification comes
				//TODO: Your logic on click of push notification directly
				if (data.title == "New Hire") {
					this.navCtrl.push(ViewNewHirePage);
				}
				else if (data.title == "Hire Confirmed") {
					this.navCtrl.push(ViewConfirmedHiresPage);
					this.sendDriverDetailsToPassenger(data.additionalData['subtitle']);
				}
				else if (data.title == "Hire Rejected") {
					this.navCtrl.push(ViewRejectedMessagePage, {
						hireNo: data.additionalData['subtitle']
					});
				}
				console.log('Push notification clicked');
			}
		});

		pushObject.on('error').subscribe(error => console.log(error));
	}

	sendDriverDetailsToPassenger(hireNo) {
		this.http.get(this.host + '/myHire_sendPassengerRemind.php?hireNo=' + hireNo).subscribe(data => {
			console.log(data);
			let message = "You have a hire. Please be on time.";
			this.toaster(message);
		},
			(err) => {
				let message = "Network error! Please check your internet connection.";
				this.toaster(message);
			});
	}

}

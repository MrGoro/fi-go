import * as admin from "firebase-admin";
import * as firestore from "@google-cloud/firestore";

export class FcmMessenger {

  sendMessage(messageContent: FcmMessageContent, uid: string): Promise<string[]> {
    return this.getUserDevices(uid)
      .then(deviceIds => {
        console.log('User ' + uid + ' has ' + deviceIds.length + ' devices');
        return this.sendMessageToDevices(messageContent, deviceIds);
      });
  }

  sendMessageToDevices(messageContent: FcmMessageContent, devices: string[]): Promise<string[]> {
    const devicesPromises: Promise<string>[] = [];
    devices.forEach(device => {
      const devicePromise: Promise<string> = this.sendMessageToDevice(messageContent, device);
      devicesPromises.push(devicePromise);
    });
    return Promise.all(devicesPromises);
  }

  sendMessageToDevice(messageContent: FcmMessageContent, device: string): Promise<string> {
    const message: admin.messaging.Message = {
      notification : {
        title: messageContent.title,
        body: messageContent.body
      },
      webpush: {
        notification: messageContent
      },
      token: device
    };
    return admin.messaging().send(message)
      .then((response) => {
        console.log('Successfully sent message: ', JSON.stringify(message) + ' | Response: ' + response);
        return device;
      });
  }

  getUserDevicesDocuments(uid: string): Promise<firestore.QueryDocumentSnapshot[]> {
    return admin.firestore().collection(`data/${uid}/fcmToken`).get().then(querySnapshot => {
      return querySnapshot.docs;
    });
  }

  getUserDevices(uid: string): Promise<string[]> {
    return this.getUserDevicesDocuments(uid)
      .then(snapshots => {
        return snapshots.map(snapshot => snapshot.data());
      })
      .then(data => {
        return data ? data.map(obj => obj['token']) : [];
      });
  }
}

export interface FcmMessageContent {
  title: string,
  body: string,
  icon?: string
}

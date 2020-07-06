import { Component, OnInit } from '@angular/core';
import { FirebaseUserModel } from '../shared/firebaseuser.model';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { UserService } from '../shared/user.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialog } from '../shared/info-dialog';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  user: Promise<FirebaseUserModel>;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private dialog: MatDialog) {
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.user = this.userService.getCurrentUser();
      } else {
        this.user = null;
      }
    });
  }

  logout() {
    this.authService.doLogout()
      .then((res) => {
        this.router.navigate(['/login']);
      }, (error) => {
        console.log('Logout error', error);
      });
  }

  info() {
    this.dialog.open(InfoDialog, {});
  }

}

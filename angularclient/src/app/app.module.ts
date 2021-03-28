import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {OAuthModule, OAuthService, OAuthStorage} from "angular-oauth2-oidc";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {MainpageComponent} from './components/mainpage/mainpage.component';
import {LOCAL_STORAGE_TOKEN, localStorageFactory} from "./service/local-storage.service";
import {isDefined} from "./commons/commons";
import {from, Observable} from "rxjs";
import {map} from "rxjs/operators";

@NgModule({
  declarations: [
    AppComponent,
    MainpageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    OAuthModule.forRoot()
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: applicationInitializerFactory,
      deps: [OAuthService],
      multi: true
    },
    {provide: LOCAL_STORAGE_TOKEN, useFactory: localStorageFactory},
    {provide: OAuthStorage, useFactory: localStorageFactory},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

export function applicationInitializerFactory(oauthService: OAuthService) {
  return () => new Promise<boolean>(resolve => {

    configure(oauthService);
    oauthService.setupAutomaticSilentRefresh();

    // Load Discovery Document and then try to login the user
    oauthService.loadDiscoveryDocument().then(() =>
      checkIdentification().subscribe(() => resolve(true))
    );
  });

  function checkIdentification(): Observable<boolean> {
    if (isDefined(oauthService.getRefreshToken())) {
      return from(oauthService.refreshToken()).pipe(map(() => oauthService.hasValidAccessToken()));
    }

    return from(oauthService.tryLogin())
  }

  function configure(oauthService: OAuthService) {
    // URL of the SPA to redirect the user to after login
    oauthService.redirectUri = window.location.origin;
    //oauthService.postLogoutRedirectUri = window.location.origin;
    // The SPA's id. The SPA is registerd with this id at the auth-server
    oauthService.clientId = "demo-spa";
    // set the scope for the permissions the client should request
    // The first three are defined by OIDC. The 4th is a usecase-specific one
    oauthService.scope = "openid profile email roles";
    // set to true, to receive also an id_token via OpenId Connect (OIDC) in addition to the
    // OAuth2-based access_token
    oauthService.issuer = 'http://localhost:8888/auth/realms/demo-realm'; // ID_Token
    oauthService.disablePKCE = true;
    oauthService.responseType = 'code';
    oauthService.showDebugInformation = true;
  }
}

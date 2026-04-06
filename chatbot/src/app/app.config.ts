import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { authInterceptor } from './shared/services/auth-interceptor';
import { routes } from './app.routes';
import { Observable } from 'rxjs';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// NOTE: We completely removed the '@ngx-translate/http-loader' import!

// 1. Create our own loader class (This bypasses the TS2554 error entirely)
export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`);
  }
}

// 2. Use our custom loader in the factory
export function HttpLoaderFactory(http: HttpClient) {
  // Since we wrote the class above, TypeScript knows exactly what this expects
  return new CustomTranslateLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
  ],
};

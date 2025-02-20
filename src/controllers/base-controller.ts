import { CookieOptions } from 'express';

class BaseController {
  protected readonly COOKIES_MAX_AGE = 72 * 60 * 60 * 1000; // 72 hours
  protected readonly COOKIES_OPTIONS: CookieOptions = {
    maxAge: this.COOKIES_MAX_AGE,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  };
}

export default BaseController;

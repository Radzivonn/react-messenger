import { JwtPayload } from 'jsonwebtoken';
import { IUserModel } from '../types/types.js';
import { IUserDTO } from '../types/types.js';

export class UserDto implements IUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;

  constructor(model: IUserModel | JwtPayload) {
    this.id = model.id;
    this.name = model.name;
    this.email = model.email;
    this.role = model.role;
  }
}

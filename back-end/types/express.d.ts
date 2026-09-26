import { HydratedDocument } from "mongoose";
import { IUser, IUserMethods } from "../models/UserModel";

export type AuthUser = HydratedDocument<IUser, IUserMethods>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

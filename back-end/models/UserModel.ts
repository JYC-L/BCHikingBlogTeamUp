import bcrypt from "bcryptjs";
import mongoose, { HydratedDocument, Model } from "mongoose";

export interface IUser {
  email: string;
  username: string;
  password: string;
  pic: string;
}

export interface IUserMethods {
  matchPassword(entered: string): Promise<boolean>;
}

type UserModelType = Model<IUser, object, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModelType, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: { type: String, required: true },
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (entered: string) {
  return bcrypt.compare(entered, this.password);
};

userSchema.set("toJSON", {
  transform(_doc, ret) {
    const safe = ret as { password?: string };
    delete safe.password;
    return safe;
  },
});

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const User = mongoose.model<IUser, UserModelType>("User", userSchema);

export default User;

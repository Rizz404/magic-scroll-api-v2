import { Profile, User } from "@prisma/client";

export interface ExtendedUser extends User {
  profile: Profile | null;
}

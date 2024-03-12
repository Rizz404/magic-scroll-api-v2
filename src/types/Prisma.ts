import { Note, Profile, Tag, User } from "@prisma/client";

export interface ExtendedUser extends User {
  profile: Profile | null;
}

export interface ExtendedNote extends Note {
  password?: string;
  sharedUsers?: string[];
  tags: Tag[];
}

import { Note, NotePermission, Profile, Tag, User } from "@prisma/client";

export interface ExtendedUser extends User {
  profile: Profile | null;
}

export interface ExtendedNote extends Note {
  notePermission?: NotePermission[];
  tags: Tag[];
}

-- AddForeignKey
ALTER TABLE "NoteInteractionCounter" ADD CONSTRAINT "NoteInteractionCounter_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

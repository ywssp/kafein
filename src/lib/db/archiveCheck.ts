import prisma from "$lib/prisma";
import type { ArchivableModels } from "../../generated/prisma/enums";

export async function canRunAutoArchive(targetModel: ArchivableModels) {
  const previousCheckCutoff = new Date();
  previousCheckCutoff.setHours(previousCheckCutoff.getHours() - 24);

  // Get the time for the last check for this model
  let lastCheck = await prisma.archiveCheckDates.findFirst({
    where: {
      for_model: targetModel
    }
  });

  // If no check was logged yet, then create a log, and allow auto-archive to run
  if (!lastCheck) {
    lastCheck = await prisma.archiveCheckDates.create({
      data: {
        check_date: new Date(),
        for_model: targetModel
      }
    });

    return true;
  } 

  // If there was a log, then check if the last run is older than 24 hours
  return lastCheck.check_date < previousCheckCutoff;
}

export async function markAutoArchiveCheck(targetModel: ArchivableModels) {
  return await prisma.archiveCheckDates.updateMany({
    where: {
      for_model: targetModel
    },
    data: {
      check_date: new Date()
    }
  });
}

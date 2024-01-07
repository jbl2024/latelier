import { Projects, ProjectStates } from "../../api/projects/projects.js";

import { Lists } from "../../api/lists/lists.js";

async function fixEmptyProjectAttributes() {
  await Projects.updateAsync(
    {
      state: { $exists: false }
    },
    {
      $set: {
        state: ProjectStates.DEVELOPMENT
      }
    },
    { multi: true }
  );
}

async function fixEmptyListAttributes() {
  await Lists.updateAsync(
    {
      autoComplete: { $exists: false }
    },
    {
      $set: {
        autoComplete: false
      }
    },
    { multi: true }
  );
  await Lists.updateAsync(
    {
      catchCompleted: { $exists: false }
    },
    {
      $set: {
        catchCompleted: false
      }
    },
    { multi: true }
  );
}

await fixEmptyProjectAttributes();
await fixEmptyListAttributes();

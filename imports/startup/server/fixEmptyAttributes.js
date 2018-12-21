import { Projects } from "../../api/projects/projects.js";
import { ProjectStates } from "../../api/projects/projects.js";
import { Lists } from "../../api/lists/lists.js";

function fixEmptyProjectAttributes() {
  Projects.update(
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

function fixEmptyListAttributes() {
  Lists.update(
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
  Lists.update(
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

fixEmptyProjectAttributes();
fixEmptyListAttributes();
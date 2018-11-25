import { Projects } from "../../api/projects/projects.js";
import { ProjectStates } from "../../api/projects/projects.js";

function fixEmptyProjectStates() {
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

fixEmptyProjectStates();
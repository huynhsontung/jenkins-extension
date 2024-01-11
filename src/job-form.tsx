import {
  ChoiceParameterDefinition,
  JenkinsJob,
  ParameterDefinitionType,
} from "./models/jenkins";
import React from "react";

interface JobFormInterface {
  jobToBuild: JenkinsJob;
  buildFormRef: React.MutableRefObject<HTMLFormElement>;
}

export const JobForm = ({ jobToBuild, buildFormRef }: JobFormInterface) => {
  console.log(jobToBuild);
  const jobParams =
    jobToBuild?.property.find(
      (job) => job._class === "hudson.model.ParametersDefinitionProperty"
    )?.parameterDefinitions ?? [];

  return (
    <form method="dialog" ref={buildFormRef}>
      {jobParams.map((job) => {
        return (
          <>
            <label htmlFor={job.name}>{job.name}: </label>
            {job.type === ParameterDefinitionType.Choice && (
              <select name={job.name}>
                {(job as ChoiceParameterDefinition).choices.map((choice) => (
                  <option key={choice} value={choice}>
                    {choice}
                  </option>
                ))}
              </select>
            )}
            {job.type === ParameterDefinitionType.Boolean && (
              <input
                name={job.name}
                type="checkbox"
                defaultChecked={job?.defaultParameterValue?.value as boolean}
              />
            )}
            {job.type === ParameterDefinitionType.Password && (
              <input type="password" name={job.name} />
            )}
            {job.type ===
              (ParameterDefinitionType.Text ||
                ParameterDefinitionType.String) && (
              <input
                name={job.name}
                defaultValue={job?.defaultParameterValue?.value as string}
              />
            )}
          </>
        );
      })}
      <div>
        <button value="build">Build</button>
        <button value="cancel">Cancel</button>
      </div>
    </form>
  );
};

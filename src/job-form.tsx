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
  const jobParams = jobToBuild.property.find(
    (job) => job._class === "hudson.model.ParametersDefinitionProperty"
  )?.parameterDefinitions;

  return (
    <form method="dialog" ref={buildFormRef}>
      {jobParams &&
        jobParams?.map((job) => {
          return (
            <select name={job.name}>
              {job.type === ParameterDefinitionType.Choice &&
                (job as ChoiceParameterDefinition).choices.map((choice) => (
                  <option value={choice}>{choice}</option>
                ))}
            </select>
          );
        })}
      <div>
        <button value="build">Build</button>
        <button value="cancel">Cancel</button>
      </div>
    </form>
  );
};

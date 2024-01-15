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
  const jobParams =
    jobToBuild?.property.find(
      (job) => job._class === "hudson.model.ParametersDefinitionProperty"
    )?.parameterDefinitions ?? [];

  return (
    <form method="dialog" ref={buildFormRef}>
      <div className="job-form">
        {jobParams.map((param) => {
          return (
            <div className="form-field">
              <label htmlFor={param.name}>{param.name}: </label>
              {param.type === ParameterDefinitionType.Choice && (
                <select name={param.name}>
                  {(param as ChoiceParameterDefinition).choices.map(
                    (choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    )
                  )}
                </select>
              )}
              {param.type === ParameterDefinitionType.Boolean && (
                <input
                  name={param.name}
                  type="checkbox"
                  defaultChecked={
                    param?.defaultParameterValue?.value as boolean
                  }
                />
              )}
              {param.type === ParameterDefinitionType.Password && (
                <input type="password" name={param.name} />
              )}
              {
                // TODO: shorten this
                (param.type === ParameterDefinitionType.String ||
                  param.type === ParameterDefinitionType.Text) && (
                  <input
                    name={param.name}
                    defaultValue={param?.defaultParameterValue?.value as string}
                  />
                )
              }
              {param.type === undefined && (
                <>
                  The parameter{" "}
                  <div className="unsupported-field">{param.name}</div> is not
                  supported.
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="form-buttons">
        <button value="build">Build</button>
        <button value="cancel">Cancel</button>
      </div>
    </form>
  );
};

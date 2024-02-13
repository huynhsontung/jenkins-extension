import { ChoiceParameterDefinition, JenkinsJob, ParameterDefinitionType, ParameterDefinition } from './models/jenkins';
import React from 'react';

interface JobFormInterface {
  jobToBuild: JenkinsJob;
  buildFormRef: React.MutableRefObject<HTMLFormElement>;
}

function UnsupportedField(param: ParameterDefinition) {
  return (
    <p>
      The parameter <span className='unsupported-field'>{param.name}</span> is not supported.
    </p>
  );
}

function ChoiceField(param: ParameterDefinition) {
  return (
    <select name={param.name}>
      {(param as ChoiceParameterDefinition).choices.map(choice => (
        <option key={choice} value={choice}>
          {choice}
        </option>
      ))}
    </select>
  );
}

function BooleanField(param: ParameterDefinition) {
  return <input name={param.name} type='checkbox' defaultChecked={param?.defaultParameterValue?.value as boolean} />;
}

function PasswordField(param: ParameterDefinition) {
  return <input type='password' name={param.name} />;
}

function TextField(param: ParameterDefinition) {
  return <input name={param.name} defaultValue={param?.defaultParameterValue?.value as string} />;
}

function RenderField(param: ParameterDefinition) {
  switch (param.type) {
    case ParameterDefinitionType.Choice:
      return ChoiceField(param);
    case ParameterDefinitionType.Boolean:
      return BooleanField(param);
    case ParameterDefinitionType.Password:
      return PasswordField(param);
    case ParameterDefinitionType.Text:
    case ParameterDefinitionType.String:
      return TextField(param);
    default:
      return UnsupportedField(param);
  }
}

export const JobForm = ({ jobToBuild, buildFormRef }: JobFormInterface) => {
  const jobParams = jobToBuild?.property.find(job => job._class === 'hudson.model.ParametersDefinitionProperty')?.parameterDefinitions ?? [];

  return (
    <form method='dialog' ref={buildFormRef}>
      <div className='job-form'>
        {jobParams.map((param, idx) => {
          return (
            <div key={idx} className='form-field'>
              <label htmlFor={param.name}>{param.name}: </label>
              {RenderField(param)}
            </div>
          );
        })}
      </div>
      <div className='form-buttons'>
        <button value='build'>Build</button>
        <button value='cancel'>Cancel</button>
      </div>
    </form>
  );
};

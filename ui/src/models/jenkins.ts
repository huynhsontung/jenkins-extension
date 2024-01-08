export interface JenkinsJob {
    _class:                "hudson.model.FreeStyleProject";
    actions:               Action[];
    description:           string;
    displayName:           string;
    displayNameOrNull:     null;
    fullDisplayName:       string;
    fullName:              string;
    name:                  string;
    url:                   string;
    buildable:             boolean;
    builds:                Build[];
    color:                 string;
    firstBuild:            Build | null;
    healthReport:          HealthReport[];
    inQueue:               boolean;
    keepDependencies:      boolean;
    lastBuild:             Build | null;
    lastCompletedBuild:    Build | null;
    lastFailedBuild:       Build | null;
    lastStableBuild:       Build | null;
    lastSuccessfulBuild:   Build | null;
    lastUnstableBuild:     Build | null;
    lastUnsuccessfulBuild: Build | null;
    nextBuildNumber:       number;
    property:              Property[];
    queueItem:             null;
    concurrentBuild:       boolean;
    disabled:              boolean;
    downstreamProjects:    any[];
    labelExpression:       string | null;
    scm:                   SCM;
    upstreamProjects:      any[];
}

export interface Action {
    _class?:               string;
    parameterDefinitions?: ParameterDefinition[];
}

export interface Build {
    _class: string;
    number: number;
    url:    string;
}

export interface HealthReport {
    description:   string;
    iconClassName: string;
    iconUrl:       string;
    score:         number;
}

export interface Property {
    _class:                string;
    parameterDefinitions?: ParameterDefinition[];
}

export interface ParameterDefinition {
    _class:                string;
    defaultParameterValue: ParameterValue | null;
    description:           null | string;
    name:                  string;
    type:                  ParameterDefinitionType;
}

export enum ParameterDefinitionType {
    Credentials = "CredentialsParameterDefinition",
    Boolean = "BooleanParameterDefinition",
    Choice = "ChoiceParameterDefinition",
    Password = "PasswordParameterDefinition",
    String = "StringParameterDefinition",
    Text = "TextParameterDefinition",
}

export interface ChoiceParameterDefinition extends ParameterDefinition {
    choices:              string[];
}

export interface RunParameterDefinition extends ParameterDefinition {
    filter:               string;
    projectName:          string;
}

export interface ParameterValue {
    _class: ParameterValueClass;
    name?:  string;
    value?: boolean | string;
}

export interface SCM {
    _class: string;
}

export interface JenkinsBuild {
    _class:            "hudson.model.FreeStyleBuild";
    actions:           JenkinsBuildAction[];
    artifacts:         any[];
    building:          boolean;
    description:       null | string;
    displayName:       string;
    duration:          number;
    estimatedDuration: number;
    executor:          any | null;
    fullDisplayName:   string;
    id:                string;
    inProgress:        boolean;
    keepLog:           boolean;
    number:            number;
    queueId:           number;
    result:            null | string;
    timestamp:         number;
    url:               string;
    builtOn:           string;
    changeSet:         ChangeSet;
    culprits:          any[];
}

export interface JenkinsBuildAction {
    _class?:                  string;
    parameters?:              ParameterValue[];
    causes?:                  Cause[];
    blockedDurationMillis?:   number;
    blockedTimeMillis?:       number;
    buildableDurationMillis?: number;
    buildableTimeMillis?:     number;
    buildingDurationMillis?:  number;
    executingTimeMillis?:     number;
    executorUtilization?:     number;
    subTaskCount?:            number;
    waitingDurationMillis?:   number;
    waitingTimeMillis?:       number;
    failCount?:               number;
    skipCount?:               number;
    totalCount?:              number;
    urlName?:                 string;
}

export interface Cause {
    _class:           string;
    shortDescription: string;
    userId?:          string;
    userName?:        string;
}

export enum ParameterValueClass {
    COMCloudbeesPluginsCredentialsCredentialsParameterValue = "com.cloudbees.plugins.credentials.CredentialsParameterValue",
    HudsonModelBooleanParameterValue = "hudson.model.BooleanParameterValue",
    HudsonModelPasswordParameterValue = "hudson.model.PasswordParameterValue",
    HudsonModelStringParameterValue = "hudson.model.StringParameterValue",
    HudsonModelTextParameterValue = "hudson.model.TextParameterValue",
}

export interface ChangeSet {
    _class: string;
    items:  any[];
    kind:   null;
}

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
    _class: string;
    name?:  string;
    value?: boolean | string;
}

export interface SCM {
    _class: string;
}

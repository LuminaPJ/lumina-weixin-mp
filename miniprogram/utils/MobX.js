import {action, observable} from 'mobx-miniprogram';
import {EMPTY_JWT} from "./LoginStoreUtil";

export const store = observable({
    isLoginStateChecked: false,
    setIsLoginStateChecked: action(function (isLoginStateChecked) {
        this.isLoginStateChecked = isLoginStateChecked;
    }),
    getIsLoginStateChecked: action(function () {
        return this.isLoginStateChecked;
    }),

    jwt: EMPTY_JWT,
    isCancellationState: true,
    isSoterEnabled: false,
    setJWT: action(function (jwt) {
        this.jwt = jwt;
    }),
    getJWT: action(function () {
        return this.jwt;
    }),
    setIsCancellationState: action(function (isCancellationState) {
        this.isCancellationState = isCancellationState;
    }),
    getIsCancellationState: action(function () {
        return this.isCancellationState;
    }),
    setIsSoterEnabled: action(function (isSoterEnabled) {
        this.isSoterEnabled = isSoterEnabled;
    }),
    getIsSoterEnabled: action(function () {
        return this.isSoterEnabled;
    }),

    approvalInfo: {},
    taskInfo: {},
    groupInfo: {},
    setApprovalInfo: action(function (approvalInfo) {
        this.approvalInfo = approvalInfo;
    }),
    getApprovalInfo: action(function () {
        return this.approvalInfo;
    }),
    setTaskInfo: action(function (taskInfo) {
        this.taskInfo = taskInfo;
    }),
    getTaskInfo: action(function () {
        return this.taskInfo;
    }),

    ossLicensesDist: {},
    setOSSLicensesDist: action(function (ossLicensesDist) {
        this.ossLicensesDist = ossLicensesDist;
    }),
    getOSSLicensesDist: action(function () {
        return this.ossLicensesDist;
    })
});
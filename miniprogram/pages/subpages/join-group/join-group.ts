// pages/subpages/join-group/join-group.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../../utils/MobX";
import {EMPTY_JWT, isLogin, loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {groupStoreUtil} from "../../../utils/store-utils/GroupStoreUtil";
import {LUMINA_SERVER_HOST} from "../../../env";
import {ErrorResponse, getErrorMessage} from "../../../utils/CommonUtil";

const util = require('../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isJoining: boolean
    groupIdValue: string
    groupPreAuthTokenValue: string
    userIdValue: string
    userNameValue: string
    requesterCommentValue: string
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isJoining: false,
        groupIdValue: '',
        groupPreAuthTokenValue: '',
        userIdValue: '',
        userNameValue: '',
        requesterCommentValue: ''
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions]
        });
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        }
        // TODO：在用户已加入任意团体的情况下，再次加入团体时无法控制用户号和用户名的页面逻辑
    }, onUnload() {
        this.storeBindings.destroyStoreBindings();
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, onGroupIdInput(e: WechatMiniprogram.Input) {
        this.setData({
            groupIdValue: e.detail.value
        })
    }, onGroupPreAuthTokenInput(e: WechatMiniprogram.Input) {
        this.setData({
            groupPreAuthTokenValue: e.detail.value
        })
    }, onUserIdInput(e: WechatMiniprogram.Input) {
        this.setData({
            userIdValue: e.detail.value
        })
    }, onUserNameInput(e: WechatMiniprogram.Input) {
        this.setData({
            userNameValue: e.detail.value
        })
    }, onRequesterCommentInput(e: WechatMiniprogram.Input) {
        this.setData({
            requesterCommentValue: e.detail.value
        })
    }, async joinNewGroup() {
        if (this.data.groupIdValue === '' || this.data.userIdValue === '' || this.data.userNameValue === '') this.setData({
            errorMessage: '存在尚未填写的信息，请检查所有信息是否填写完毕', errorVisible: true
        }); else {
            this.setData({
                isJoining: true
            })
            try {
                await joinNewGroupPromise(this.getJWT(), this.data.groupIdValue, this.data.userIdValue, this.data.userNameValue, this.data.groupPreAuthTokenValue === '' ? null : this.data.groupPreAuthTokenValue, this.data.requesterCommentValue === '' ? null : this.data.requesterCommentValue)
            } catch (e: any) {
                this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                })
            } finally {
                this.setData({
                    isJoining: false
                })
            }
        }
    }

})

function buildJoinNewGroupRequestBodyJson(userId: string, userName: string, groupPreAuthToken: string | null, requesterComment: string | null): Object {
    {
        const optionalFields = {
            ...(groupPreAuthToken && {groupPreAuthToken}), ...(requesterComment && {requesterComment})
        };
        return {
            requesterUserId: userId, requesterUserName: userName, ...optionalFields
        };
    }
}

async function joinNewGroupPromise(jwt: string, groupId: string, userId: string, userName: string, groupPreAuthToken: string | null, requesterComment: string | null) {
    const requestJsonString = buildJoinNewGroupRequestBodyJson(userId, userName, groupPreAuthToken, requesterComment)
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group/' + groupId + '/join', method: 'POST', header: {
                Authorization: 'Bearer ' + jwt
            }, data: JSON.stringify(requestJsonString), success: (res) => {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}


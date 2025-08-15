// pages/subpages/group-management/selected-group-user/selected-group-user.ts

import ActionSheet, {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {store, StoreInstance} from "../../../../utils/MobX";
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import Message from 'tdesign-miniprogram/message/index';
import {
    getGroupInfoPromise,
    GroupInfoDetail,
    GroupInfoMember,
    groupStoreUtil
} from "../../../../utils/store-utils/GroupStoreUtil";
import {
    getErrorMessage,
    isAdminAndSuperAdmin,
    isNullOrEmptyOrUndefined,
    isSuperAdmin
} from "../../../../utils/CommonUtil";
import {luminaStartSoter} from "../../../../utils/security/SoterUtil";
import {groupUserActionPromise, REMOVE_MEMBER, RESET_TO_MEMBER, SET_ADMIN} from "../../../../utils/GroupManagerUtil";

const util = require('../../../../utils/CommonUtil')

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedGroupId: string
    selectedGroupName: string | null
    selectedGroupUserPermission: string
    selectedGroupMemberList: GroupInfoMember[]
    clickedUserId: string,
    clickedUserName: string | null,
    clickedUserPermission: string | null,
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isRefreshing: true,
        isSelectedNotFound: false,
        selectedGroupId: '',
        selectedGroupName: null,
        selectedGroupUserPermission: '',
        selectedGroupMemberList: [],
    }, async onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions]
        });
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await getIsUserSoterEnabled(this)
                const selectedGroupId = options.selectedGroupId;
                if (isNullOrEmptyOrUndefined(selectedGroupId)) this.setData({
                    isSelectedNotFound: true
                }); else if (selectedGroupId) await getSelectedGroupInfo(this, selectedGroupId)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, async onRefresh() {
        this.setData({
            isRefreshing: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await getIsUserSoterEnabled(this);
                if (!this.data.isSelectedNotFound) await getSelectedGroupInfo(this, this.data.selectedGroupId)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            });
        }
    }, manageGroupUser() {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) ActionSheet.show({
            theme: ActionSheetTheme.Grid,
            selector: '#t-action-sheet',
            context: this,
            items: isSuperAdmin(this.data.selectedGroupUserPermission) ? manageGroupUserFabTaskGridWithSuperAdmin : manageGroupUserFabTaskGridWithAdmin,
        });
    }, onClickGroupUserItem(e: WechatMiniprogram.CustomEvent) {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) {
            const userId = e.currentTarget.dataset.userId
            const userInfo = this.data.selectedGroupMemberList.find(member => member.userId === userId) ?? null
            const userName = userInfo?.userName ?? null
            const userPermission = userInfo?.permission ?? null
            this.setData({
                clickedUserId: userId,
                clickedUserName: userName,
                clickedUserPermission: userPermission,
                userDetailPopupVisible: true
            })
        }
    }, userDetailPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            userDetailPopupVisible: e.detail.visible
        })
    }, closeUserDetailPopup() {
        this.setData({
            userDetailPopupVisible: false
        })
    }, async setAdmin() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else {
            this.setData({
                isAdminSetting: true
            })
            try {
                await performGroupUserAction(this, SET_ADMIN)
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isAdminSetting: false
                })
            }
        }
    }, async removeAdmin() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else {
            this.setData({
                isAdminRemoving: true
            })
            try {
                await performGroupUserAction(this, RESET_TO_MEMBER)
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isAdminRemoving: false
                })
            }
        }
    }, async deleteUser() {
        if (!isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else {
            this.setData({
                isUserDeleting: true
            })
            try {
                await performGroupUserAction(this, REMOVE_MEMBER)
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isUserDeleting: false
                })
            }
        }
    },
})

async function performGroupUserAction(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, action: string) {
    await loginStoreUtil.initLoginStore(that)
    let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
    await getIsUserSoterEnabled(that)
    if (that.getIsSoterEnabled()) {
        soterResult = await luminaStartSoter("为 " + that.data.selectedGroupId + " 设置管理员 " + that.data.clickedUserId)
        if (soterResult === null) {
            that.setData({
                errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
            });
            return;
        }
    }
    const userInfo = {
        userId: that.data.clickedUserId, ...(that.data.clickedUserName && {userName: that.data.clickedUserName})
    }
    await groupUserActionPromise(action, that.getJWT(), that.data.selectedGroupId, [userInfo], soterResult)
    if (!that.data.isSelectedNotFound) await getSelectedGroupInfo(that, that.data.selectedGroupId)
    that.setData({
        userDetailPopupVisible: false
    })
}

async function getSelectedGroupInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedGroupId: string) {
    const selectedGroupInfo: GroupInfoDetail = await getGroupInfoPromise(that.getJWT(), selectedGroupId);
    const selectedGroupUserPermission = selectedGroupInfo.memberList.find(member => member.userId === that.getUserInfo().userId)?.permission
    that.setData({
        selectedGroupId: selectedGroupInfo.groupId,
        selectedGroupName: selectedGroupInfo.groupName,
        selectedGroupUserPermission: selectedGroupUserPermission ?? "MEMBER",
        selectedGroupMemberList: selectedGroupInfo.memberList
    })
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}

const manageGroupUserFabTaskGridWithAdmin = [{
    label: '批量删除用户', icon: 'user-clear',
}];

const manageGroupUserFabTaskGridWithSuperAdmin = [{
    label: '批量设为管理', icon: 'user-arrow-up',
}, {
    label: '批量撤销管理', icon: 'user-arrow-down',
}, {
    label: '批量删除用户', icon: 'user-clear',
}];


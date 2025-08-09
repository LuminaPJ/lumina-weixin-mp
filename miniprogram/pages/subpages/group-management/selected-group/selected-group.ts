// pages/subpages/group-management/selected-group/selected-group.ts
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store} from "../../../../utils/MobX";
import {userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import {
    getGroupInfoPromise,
    GroupInfo,
    GroupInfoMember,
    groupStoreUtil
} from "../../../../utils/store-utils/GroupStoreUtil";
import Message from 'tdesign-miniprogram/message/index';
import {
    formatTime,
    getErrorMessage,
    isAdminAndSuperAdmin,
    isNullOrEmptyOrUndefined
} from "../../../../utils/CommonUtil";
import dayjs from "dayjs";
import {luminaStartSoter} from "../../../../utils/security/SoterUtil";
import {renameGroupPromise, setGroupPreAuthTokenPromise} from "../../../../utils/GroupManagerUtil";

const util = require('../../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedGroupId: string
    selectedGroupName: string | null
    selectedGroupUserPermission: string
    selectedGroupCreateAt: string
    selectedIsPreAuthTokenEnable: boolean
    selectedGroupMemberList: GroupInfoMember[]
    preAuthTokenValidityValue: number
    setPreAuthTokenPopupVisible: boolean
    preAuthTokenValue: string
    isPreAuthTokenSubmitting: boolean
    renameGroupValue: string
    renameGroupPopupVisible: boolean
    isGroupRenaming: boolean
}

Page<IData, WechatMiniprogram.App.TrivialInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isRefreshing: true,
        isSelectedNotFound: false,
        selectedGroupId: '',
        selectedGroupName: null,
        selectedGroupUserPermission: '',
        selectedGroupCreateAt: '',
        selectedIsPreAuthTokenEnable: false,
        selectedGroupMemberList: [],
        preAuthTokenValidityValue: 10,
        setPreAuthTokenPopupVisible: false,
        preAuthTokenValue: '',
        isPreAuthTokenSubmitting: false,
        renameGroupValue: '',
        renameGroupPopupVisible: false,
        isGroupRenaming: false
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
            console.error(e)
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
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
    }, async onRefresh() {
        this.setData({
            isRefreshing: true
        });
        try {
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await getIsUserSoterEnabled(this)
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
    }, setPreAuthTokenPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            setPreAuthTokenPopupVisible: e.detail.visible
        })
    }, onPreAuthTokenClick() {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            setPreAuthTokenPopupVisible: true
        })
    }, closeSetPreAuthTokenPopup() {
        this.setData({
            setPreAuthTokenPopupVisible: false
        })
    }, onChangePreAuthTokenValidity(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            preAuthTokenValidityValue: e.detail.value
        })
    }, onChangePreAuthToken(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            preAuthTokenValue: e.detail.value
        })
    }, async continueSetPreAuthToken() {
        if (this.data.preAuthTokenValue === '') this.setData({
            errorMessage: '请输入预授权凭证', errorVisible: true
        }); else {
            this.setData({
                isPreAuthTokenSubmitting: true
            })
            try {
                let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
                await getIsUserSoterEnabled(this)
                if (this.getIsSoterEnabled()) {
                    soterResult = await luminaStartSoter("设置预授权凭证")
                    if (soterResult === null) {
                        this.setData({
                            errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征",
                            errorVisible: true
                        });
                        return;
                    }
                }
                await setGroupPreAuthTokenPromise(this.getJWT(), this.data.selectedGroupId, this.data.preAuthTokenValue, this.data.preAuthTokenValidityValue, soterResult)
                if (!this.data.isSelectedNotFound) await getSelectedGroupInfo(this, this.data.selectedGroupId)
                normalToast(this, '预授权凭证已生效')
                this.setData({
                    setPreAuthTokenPopupVisible: false
                });
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isPreAuthTokenSubmitting: false
                })
            }
        }
    }, renameGroupPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            renameGroupPopupVisible: e.detail.visible
        })
    }, onRenameGroupClick() {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            renameGroupPopupVisible: true
        })
    }, closeRenameGroupPopup() {
        this.setData({
            renameGroupPopupVisible: false
        })
    }, onChangeRenameGroup(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            renameGroupValue: e.detail.value
        })
    }, async continueRenameGroup() {
        if (this.data.renameGroupValue === '') this.setData({
            errorMessage: '请输入群组名称', errorVisible: true
        }); else {
            this.setData({
                isGroupRenaming: true
            })
            try {
                let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
                await getIsUserSoterEnabled(this)
                if (this.getIsSoterEnabled()) {
                    soterResult = await luminaStartSoter("重命名团体 " + this.data.selectedGroupId)
                    if (soterResult === null) {
                        this.setData({
                            errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征",
                            errorVisible: true
                        });
                        return;
                    }
                }
                await renameGroupPromise(this.getJWT(), this.data.selectedGroupId, this.data.renameGroupValue, soterResult)
                if (!this.data.isSelectedNotFound) await getSelectedGroupInfo(this, this.data.selectedGroupId)
                normalToast(this, '重命名成功')
                this.setData({
                    renameGroupPopupVisible: false
                });
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isGroupRenaming: false
                })
            }
        }
    }
})

async function getSelectedGroupInfo(that: WechatMiniprogram.App.TrivialInstance, selectedGroupId: string) {
    const selectedGroupInfo: GroupInfo = await getGroupInfoPromise(that.getJWT(), selectedGroupId);
    const selectedGroupUserPermission = selectedGroupInfo.memberList.find(member => member.userId === that.getUserInfo().userId)?.permission
    const selectedGroupCreateAt = formatTime(dayjs(selectedGroupInfo.createAt).toDate())
    that.setData({
        selectedGroupId: selectedGroupInfo.groupId,
        selectedGroupName: selectedGroupInfo.groupName,
        selectedGroupCreateAt: selectedGroupCreateAt,
        selectedGroupUserPermission: selectedGroupUserPermission ?? "MEMBER",
        selectedIsPreAuthTokenEnable: selectedGroupInfo.isPreAuthTokenEnable,
        selectedGroupMemberList: selectedGroupInfo.memberList
    })
}

function normalToast(that: WechatMiniprogram.App.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}


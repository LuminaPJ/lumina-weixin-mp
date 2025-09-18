/**
 * Copyright (c) 2025 LuminaPJ
 * SM2 Key Generator is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
import {action, observable} from 'mobx-miniprogram';

export interface AgreementBadgeStoreType {
    // 法律文本提示红点设置
    isShowUserAgreementBadge: boolean;
    setIsShowUserAgreementBadge: (isShowUserAgreementBadge: boolean) => void;
    getIsShowUserAgreementBadge: () => boolean;

    isShowPrivacyPolicyBadge: boolean;
    setIsShowPrivacyPolicyBadge: (isShowPrivacyPolicyBadge: boolean) => void;
    getIsShowPrivacyPolicyBadge: () => boolean;

    isShowPersonalInformationCollectionListBadge: boolean;
    setIsShowPersonalInformationCollectionListBadge: (isShowPersonalInformationCollectionListBadge: boolean) => void;
    getIsShowPersonalInformationCollectionListBadge: () => boolean;

    isShowThirdPartyPersonalInformationSharingListBadge: boolean;
    setIsShowThirdPartyPersonalInformationSharingListBadge: (isShowThirdPartyPersonalInformationSharingListBadge: boolean) => void;
    getIsShowThirdPartyPersonalInformationSharingListBadge: () => boolean;
}

export const agreementBadgeStore: AgreementBadgeStoreType = observable({
    isShowUserAgreementBadge: false,
    setIsShowUserAgreementBadge: action(function (isShowUserAgreementBadge: boolean) {
        agreementBadgeStore.isShowUserAgreementBadge = isShowUserAgreementBadge;
    }),
    getIsShowUserAgreementBadge: action(function () {
        return agreementBadgeStore.isShowUserAgreementBadge;
    }),

    isShowPrivacyPolicyBadge: false,
    setIsShowPrivacyPolicyBadge: action(function (isShowPrivacyPolicyBadge: boolean) {
        agreementBadgeStore.isShowPrivacyPolicyBadge = isShowPrivacyPolicyBadge;
    }),
    getIsShowPrivacyPolicyBadge: action(function () {
        return agreementBadgeStore.isShowPrivacyPolicyBadge;
    }),

    isShowPersonalInformationCollectionListBadge: false,
    setIsShowPersonalInformationCollectionListBadge: action(function (isShowPersonalInformationCollectionListBadge: boolean) {
        agreementBadgeStore.isShowPersonalInformationCollectionListBadge = isShowPersonalInformationCollectionListBadge;
    }),
    getIsShowPersonalInformationCollectionListBadge: action(function () {
        return agreementBadgeStore.isShowPersonalInformationCollectionListBadge;
    }),

    isShowThirdPartyPersonalInformationSharingListBadge: false,
    setIsShowThirdPartyPersonalInformationSharingListBadge: action(function (isShowThirdPartyPersonalInformationSharingListBadge: boolean) {
        agreementBadgeStore.isShowThirdPartyPersonalInformationSharingListBadge = isShowThirdPartyPersonalInformationSharingListBadge;
    }),
    getIsShowThirdPartyPersonalInformationSharingListBadge: action(function () {
        return agreementBadgeStore.isShowThirdPartyPersonalInformationSharingListBadge;
    })
});

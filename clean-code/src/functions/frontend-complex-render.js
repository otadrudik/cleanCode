//@@viewOn:imports
import React from "react";
import memoizeOne from "memoize-one";
import * as UU5 from "../uu5g04";
import "uu5g04-bricks";
import Calls from "../calls";
import NecsBaseLayout from "../bricks/necs-base-layout";
import ControlPanel from "./production-device-version-control-panel";
import GeneralInfo from "./production-device-version-general-info";
import Metering from "./production-device-version-metering";
import Ownership from "./production-device-version-ownership";
import OwnershipPermission from "./config/production-device-version-ownership-permissions";
import Licenses from "./production-device-version-licenses";
import UserContext from "../core/user-context";
import Config from "./config/config.js";
import AlertUtils from "../bricks/helpers/alert-utils";
import getEnumeration from "../bricks/helpers/get-enumeration";
import Lsi from "../lsi/routes/manage-production-devices-lsi";

//@@viewOff:imports
const lsi = Lsi.detail;

export const ProductionDeviceVersionDetail = UU5.Common.VisualComponent.create({
  //@@viewOn:mixins
  mixins: [UU5.Common.BaseMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: Config.TAG + "ProductionDeviceVersionDetail",
    classNames: {
      main: Config.CSS + "production-device-version-detail",
    },
    lsi: lsi,
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    onBackToList: UU5.PropTypes.func,
    selectedProductionDeviceVersion: UU5.PropTypes.object,
    onChangeSelectedProductionDeviceVersion: UU5.PropTypes.func,
    onEdit: UU5.PropTypes.func,
    onCreate: UU5.PropTypes.func,
    handleChangeIssuingAccount: UU5.PropTypes.func,
    onMeteredData: UU5.PropTypes.func,
    backButton: UU5.PropTypes.bool,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      onBackToList: null,
      selectedProductionDeviceVersion: null,
      onChangeSelectedProductionDeviceVersion: null,
      onEdit: null,
      onCreate: null,
      handleChangeIssuingAccount: null,
      onMeteredData: null,
      backButton: false,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    this._memoLoadPDversion = memoizeOne(this._loadProductionDeviceVersion);
    this._memoLoadCertificateAccountNames = memoizeOne(this._asyncLoadCertificateAccountNames);
    return {
      accountHolderNames: {
        // code: name
      },
    };
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _getUsedAccountHolderCodes() {
    let accountHolderCodes = [];
    Object.keys(getEnumeration("SCHEME").values)
      .map((code) => code.toLowerCase())
      .forEach((scheme) => {
        if (this.props.selectedProductionDeviceVersion.issuingAccounts[scheme]) {
          accountHolderCodes = accountHolderCodes.concat(this.props.selectedProductionDeviceVersion.issuingAccounts[scheme].map((ia) => ia.accountHolderCode));
        }
      });
    return accountHolderCodes;
  },

  _getUsedCertificateAccountCodes(scheme) {
    if (this.props.selectedProductionDeviceVersion.issuingAccounts[scheme]) {
      return this.props.selectedProductionDeviceVersion.issuingAccounts[scheme].map((ia) => ia.certificateAccountNumber);
    }
    return [];
  },

  /**
   * Returns true if user has access to account holder name of scheme
   * @param {OwnershipPermission} permissions Onwership permissions
   * @param {string} scheme Scheme
   */
  _hasUserAccessToSchemeAccountHolderName(permissions, scheme) {
    for (var ownership of this.props.selectedProductionDeviceVersion.pdOwners) {
      if (permissions.hasUserAccessToSchemeAccountHolderName(ownership, scheme)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Returns true if user has access to issuing account name of scheme
   * @param {OwnershipPermission} permissions Onwership permissions
   * @param {string} scheme Scheme
   */
  _hasUserAccessToSchemeIssuingAccountName(permissions, scheme) {
    for (var ownership of this.props.selectedProductionDeviceVersion.pdOwners) {
      if (permissions.hasUserAccessToSchemeIssuingAccountName(ownership, scheme)) {
        return true;
      }
    }
    return false;
  },

  async _asyncLoadAHNames(permissions) {
    const accountHolderNames = {
      // code: name
    };
    const accountHolderCodes = this._getUsedAccountHolderCodes();
    if (accountHolderCodes.length) {
      for (let scheme of Object.keys(getEnumeration("SCHEME").values)) {
        if (this._hasUserAccessToSchemeAccountHolderName(permissions, scheme)) {
          const accountHolders = await Calls.listPublicAccountHolderPromise({
            scheme,
          });
          accountHolders.itemList.forEach((ah) => (accountHolderNames[ah.code] = ah.name));
        }
      }
    }
    this.setState({ accountHolderNames: accountHolderNames });
  },

  _asyncLoadCertificateAccountNames(selectedProductionDeviceVersion, subApps) {
    return async () => {
      const permissions = new OwnershipPermission(selectedProductionDeviceVersion, subApps);
      const certificateAccountNames = {};
      for (let scheme of Object.keys(getEnumeration("SCHEME").values)) {
        certificateAccountNames[scheme] = {};
        if (this._hasUserAccessToSchemeIssuingAccountName(permissions, scheme)) {
          let certificateAccountCodes = this._getUsedCertificateAccountCodes(scheme.toLowerCase());
          if (certificateAccountCodes.length) {
            try {
              let certificateAccounts = await Calls.listPromiseCertificateAccount(
                {
                  filterMap: {
                    accountNumber: certificateAccountCodes,
                  },
                },
                scheme
              );
              certificateAccounts.itemList.forEach((account) => (certificateAccountNames[scheme][account.accountNumber] = account.name));
            } catch (ex) {
              // User is not authorized to execute the use-case
            }
          }
        }
      }
      return { certificateAccountNames };
    };
  },

  _loadProductionDeviceVersion(subApps) {
    return async () => {
      const versions = await Calls.listProductionDeviceVersion({
        filterMap: {
          productionDeviceBusinessId: [this.props.selectedProductionDeviceVersion.productionDeviceBusinessId],
        },
        sorterList: [{ key: "versionStartDate", descending: true }],
      });

      const permissions = new OwnershipPermission(this.props.selectedProductionDeviceVersion, subApps);
      await this._asyncLoadAHNames(permissions);

      return { versions };
    };
  },

  _onBackToList() {
    if (this.props.onBackToList) {
      this.props.onBackToList();
    }
  },

  _handleChangeIssuingAccount() {
    this.props.handleChangeIssuingAccount && this.props.handleChangeIssuingAccount();
    AlertUtils.showSuccess(<UU5.Bricks.Lsi lsi={Lsi.detail.successMessage} />, "success", 5000);
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    const version = this.props.selectedProductionDeviceVersion;
    const backToRoute = UU5.Common.Tools.getUrlParam("backToRoute");

    return (
      <UU5.Bricks.Div {...this.getMainPropsToPass()}>
        <UserContext.Consumer>
          {({ subApps }) => (
            <UU5.Common.Loader onLoad={this._memoLoadPDversion(subApps)}>
              {({ isLoading, isError, data }) => {
                if (isLoading) {
                  return <UU5.Bricks.Loading />;
                } else if (isError) {
                  return <UU5.Common.Error content={this.getLsiComponent("unableToLoadData")} />;
                } else {
                  const { versions } = data;
                  return (
                    <NecsBaseLayout
                      header={version.name}
                      right={
                        this.props.onBackToList && (
                          <UU5.Bricks.Button onClick={this._onBackToList} colorSchema={"primary"} size="l">
                            <UU5.Bricks.Icon icon="mdi-chevron-left" />
                            {backToRoute && backToRoute.includes("manage-issuing-statistics") ? this.getLsiComponent("back") : this.getLsiComponent("backToListButton")}
                          </UU5.Bricks.Button>
                        )
                      }
                    >
                      <ControlPanel
                        selectedProductionDeviceVersion={version}
                        onChangeSelectedProductionDeviceVersion={this.props.onChangeSelectedProductionDeviceVersion}
                        versionList={versions.itemList}
                        onCreate={this.props.onCreate}
                        onEdit={this.props.onEdit}
                      />
                      {version && (
                        <>
                          <GeneralInfo version={version} />
                          <Metering
                            onMeteredData={() => {
                              this.props.onMeteredData(versions.itemList);
                            }}
                            version={version}
                            subApps={subApps}
                          />

                          <UU5.Common.Loader onLoad={this._memoLoadCertificateAccountNames(this.props.selectedProductionDeviceVersion, subApps)}>
                            {({ isLoading, isError, data }) => {
                              if (isLoading) {
                                return <UU5.Bricks.Loading />;
                              } else if (isError) {
                                return <UU5.Common.Error content={this.getLsiComponent("unableToLoadData")} />;
                              } else {
                                const { certificateAccountNames } = data;
                                return (
                                  <Ownership
                                    version={version}
                                    certificateAccountNames={certificateAccountNames}
                                    accountHolderNames={this.state.accountHolderNames}
                                    handleChangeIssuingAccount={this._handleChangeIssuingAccount}
                                  />
                                );
                              }
                            }}
                          </UU5.Common.Loader>
                          <Licenses version={version} licenseList={versions.licences} />
                        </>
                      )}
                    </NecsBaseLayout>
                  );
                }
              }}
            </UU5.Common.Loader>
          )}
        </UserContext.Consumer>
      </UU5.Bricks.Div>
    );
  },
  //@@viewOff:render
});

export default ProductionDeviceVersionDetail;

import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { connect } from 'react-redux';

import LinkFooter from 'soapbox/features/ui/components/link_footer';
import BundleContainer from 'soapbox/features/ui/containers/bundle_container';
import {
  PromoPanel,
  InstanceInfoPanel,
  InstanceModerationPanel,
} from 'soapbox/features/ui/util/async-components';
import { federationRestrictionsDisclosed } from 'soapbox/utils/state';

import { Layout } from '../components/ui';

const mapStateToProps = state => {
  const me = state.me;
  const account = state.accounts.get(me);

  return {
    me,
    disclosed: federationRestrictionsDisclosed(state),
    isAdmin: Boolean(account?.admin),
  };
};

export default @connect(mapStateToProps)
class RemoteInstancePage extends ImmutablePureComponent {

  render() {
    const { children, params: { instance: host }, disclosed, isAdmin } = this.props;

    return (
      <>
        <Layout.Main>
          {children}
        </Layout.Main>

        <Layout.Aside>
          <BundleContainer fetchComponent={PromoPanel}>
            {Component => <Component key='promo-panel' />}
          </BundleContainer>
          <BundleContainer fetchComponent={InstanceInfoPanel}>
            {Component => <Component host={host} />}
          </BundleContainer>
          {(disclosed || isAdmin) && (
            <BundleContainer fetchComponent={InstanceModerationPanel}>
              {Component => <Component host={host} />}
            </BundleContainer>
          )}
          <LinkFooter key='link-footer' />
        </Layout.Aside>
      </>
    );
  }

}

import React, {Component} from 'react';
import {ScrollView} from 'react-native';
import {Field, change, initialize} from 'redux-form';
import {omit} from 'lodash';
import styles from './customize-invoice-style';
import {
  CUSTOMIZE_INVOICE_FORM,
  INVOICE_SWITCH_FIELDS,
  INVOICE_SETTINGS_TYPE
} from 'stores/customize/types';
import t from 'locales/use-translation';
import {IProps, IStates} from './customize-invoice-type';
import {routes} from '@/navigation';
import {hasTextLength, hasValue, isBooleanTrue} from '@/constants';
import {NumberScheme, DueDate} from '../customize-common';
import {
  fetchCustomizeSettings,
  updateCustomizeSettings
} from 'stores/customize/actions';
import {
  DefaultLayout,
  ToggleSwitch,
  CtDivider,
  Editor,
  PLACEHOLDER_TYPES as TYPE,
  Text,
  ActionButton
} from '@/components';

export default class CustomizeInvoice extends Component<IProps, IStates> {
  constructor(props) {
    super(props);
    this.state = {isFetchingInitialData: true};
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(
      fetchCustomizeSettings(INVOICE_SETTINGS_TYPE, res => {
        this.setInitialData(res);
        this.setState({isFetchingInitialData: false});
      })
    );
  }

  setInitialData = res => {
    const {dispatch} = this.props;
    const data = {
      ...res,
      invoice_auto_generate: isBooleanTrue(res?.invoice_auto_generate),
      invoice_email_attachment: isBooleanTrue(res?.invoice_email_attachment),
      set_due_date_automatically: isBooleanTrue(res?.set_due_date_automatically)
    };

    dispatch(initialize(CUSTOMIZE_INVOICE_FORM, data));
  };

  setFormField = (field, value) => {
    this.props.dispatch(change(CUSTOMIZE_INVOICE_FORM, field, value));
  };

  getTextAreaPlaceholderTypes = () => {
    const company = [TYPE.PREDEFINE_COMPANY, TYPE.INVOICE];
    const email = [TYPE.PREDEFINE_CUSTOMER, TYPE.CUSTOMER, TYPE.INVOICE];
    const shipping = [
      TYPE.PREDEFINE_SHIPPING,
      TYPE.PREDEFINE_CUSTOMER,
      TYPE.CUSTOMER,
      TYPE.INVOICE
    ];
    const billing = [
      TYPE.PREDEFINE_BILLING,
      TYPE.PREDEFINE_CUSTOMER,
      TYPE.CUSTOMER,
      TYPE.INVOICE
    ];

    return {
      email,
      company,
      shipping,
      billing
    };
  };

  onSave = values => {
    const {navigation, dispatch} = this.props;
    let params = values;
    for (const key in params) {
      if (key.includes('mail_body') || key.includes('address_format')) {
        if (!hasValue(params[key]) || !hasTextLength(params[key])) {
          params[key] = `<p></p>`;
        }
      }
    }
    INVOICE_SWITCH_FIELDS.forEach(
      field => (params[field] = params[field] === true ? 'YES' : 'NO')
    );
    params = omit(params, ['next_umber']);
    dispatch(updateCustomizeSettings({params, navigation}));
  };

  TEXTAREA_FIELDS = () => {
    const {
      email,
      company,
      shipping,
      billing
    } = this.getTextAreaPlaceholderTypes();

    return (
      <>
        <Editor
          {...this.props}
          types={email}
          name={'invoice_mail_body'}
          label={'customizes.addresses.sendInvoiceEmailBody'}
          showPreview
        />

        <Editor
          {...this.props}
          types={company}
          name={'invoice_company_address_format'}
          label={'customizes.addresses.company'}
          showPreview
        />

        <Editor
          {...this.props}
          types={shipping}
          name={'invoice_shipping_address_format'}
          label={'customizes.addresses.shipping'}
          showPreview
        />

        <Editor
          {...this.props}
          types={billing}
          name={'invoice_billing_address_format'}
          label={'customizes.addresses.billing'}
          showPreview
        />
      </>
    );
  };

  TOGGLE_FIELD_VIEW = () => {
    const {theme} = this.props;
    return (
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <CtDivider dividerStyle={styles.dividerLine} />

        <Text
          color={theme.header.primary.color}
          style={styles.autoGenerateHeader}
        >
          {t('customizes.setting.invoice')}
        </Text>
        <Field
          name={'invoice_auto_generate'}
          component={ToggleSwitch}
          hint={t('customizes.autoGenerate.invoice')}
          description={t('customizes.autoGenerate.invoiceDescription')}
        />
        <Field
          name={'invoice_email_attachment'}
          component={ToggleSwitch}
          hint={t('customizes.emailAttachment.invoice')}
          description={t('customizes.emailAttachment.invoiceDescription')}
        />
      </ScrollView>
    );
  };

  render() {
    const {
      navigation,
      theme,
      handleSubmit,
      loading,
      formValues: {
        invoice_number_scheme,
        invoice_prefix,
        invoice_number_separator,
        invoice_number_length,
        set_due_date_automatically
      }
    } = this.props;
    const {isFetchingInitialData} = this.state;
    const bottomAction = [
      {
        label: 'button.save',
        onPress: () => handleSubmit(this.onSave)(),
        loading: loading || isFetchingInitialData
      }
    ];

    return (
      <DefaultLayout
        headerProps={{
          leftIconPress: () => navigation.navigate(routes.CUSTOMIZE_LIST),
          title: t('header.invoices'),
          rightIconPress: null,
          placement: 'center',
          leftArrow: 'primary'
        }}
        bottomAction={<ActionButton buttons={bottomAction} />}
        loadingProps={{is: isFetchingInitialData}}
        hideScrollView
        toastProps={{
          reference: ref => (this.toastReference = ref)
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          <Text
            color={theme.header.primary.color}
            style={styles.autoGenerateHeader}
          >
            {t('customizes.numberLabel.invoice')}
          </Text>

          <NumberScheme
            {...this.props}
            keyName={`invoice`}
            numberSchemeField={{
              name: 'invoice_number_scheme',
              value: invoice_number_scheme
            }}
            prefixField={{
              name: 'invoice_prefix',
              value: invoice_prefix
            }}
            separatorField={{
              name: 'invoice_number_separator',
              value: invoice_number_separator
            }}
            numberLengthField={{
              name: 'invoice_number_length',
              value: invoice_number_length
            }}
          />
          <DueDate
            toggleField={{
              name: 'set_due_date_automatically',
              hint: t('customizes.dueDate.switchLabel'),
              description: t('customizes.dueDate.description'),
              value: set_due_date_automatically
            }}
            dueDateField={{
              name: 'due_date_days',
              hint: t('customizes.dueDate.inputLabel')
            }}
          />
          {this.TEXTAREA_FIELDS()}
          {this.TOGGLE_FIELD_VIEW()}
        </ScrollView>
      </DefaultLayout>
    );
  }
}

import React, {Component} from 'react';
import {View, Keyboard, ScrollView} from 'react-native';
import {Field, change} from 'redux-form';
import {CUSTOMER_ADDRESS} from '../../constants';
import t from 'locales/use-translation';
import {keyboardType, MAX_LENGTH} from '@/constants';
import styles from './styles';
import {SlideModal, BaseInput, ActionButton, BaseSelect} from '@/components';
import {CountrySelectModal} from '@/select-modal';

type IProps = {
  label: string,
  icon: string,
  onChangeCallback: () => void,
  placeholder: string,
  containerStyle: Object,
  rightIcon: string,
  leftIcon: string,
  color: string,
  value: string,
  items: Object,
  rightIcon: string,
  hasBillingAddress: boolean,
  meta: Object,
  handleSubmit: () => void,
  type: string
};

let country = 'country_id';
let state = 'state';
let city = 'city';

let addressField = [
  'name',
  'address_street_1',
  'address_street_2',
  'phone',
  'zip',
  'country_id',
  'state',
  'city',
  'type'
];

export class Address extends Component<IProps> {
  countryReference: any;

  constructor(props) {
    super(props);
    this.countryReference = React.createRef();

    this.state = {
      visible: false,
      values: '',
      status: false,
      isKeyboardVisible: false
    };
  }

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard?.addListener?.(
      'keyboardDidShow',
      () => {
        this.setState({isKeyboardVisible: true});
      }
    );
    this.keyboardDidHideListener = Keyboard?.addListener?.(
      'keyboardDidHide',
      () => {
        this.setState({isKeyboardVisible: false});
      }
    );
  };

  componentWillUnmount = () => {
    this.keyboardDidShowListener?.remove?.();
    this.keyboardDidHideListener?.remove?.();
  };

  fillShippingAddress = status => {
    if (status) {
      this.setState({status});
      const {autoFillValue} = this.props;

      if (typeof autoFillValue !== 'undefined') {
        addressField.map(field => {
          this.setFormField(field, autoFillValue[field]);
        });

        if (autoFillValue?.country_id) {
          this.countryReference?.changeDisplayValueByUsingCompareField?.(
            autoFillValue?.country_id
          );
        }
      }
    } else {
      this.setState({status});
      this.clearFormField();
    }
  };

  onToggle = () => {
    const {visible, status} = this.state;
    const {addressValue, hasBillingAddress, autoFillValue} = this.props;

    if (!visible) {
      if (typeof addressValue !== 'undefined') {
        addressField.map(field => {
          this.setFormField(field, addressValue[field]);
        });
      }

      if (
        !hasBillingAddress &&
        status === true &&
        typeof addressValue === 'undefined'
      ) {
        if (typeof autoFillValue !== 'undefined') {
          addressField.map(field => {
            this.setFormField(field, autoFillValue[field]);
          });
        }
      }
    } else {
      if (typeof addressValue === 'undefined') this.clearFormField();
    }
    this.setState(({visible}) => ({visible: !visible}));
  };

  setFormField = (field, value) => {
    this.props.dispatch(change(CUSTOMER_ADDRESS, field, value));
  };

  clearFormField = () => {
    addressField.map(field => {
      this.setFormField(field, '');
    });
  };

  saveAddress = address => {
    const {onChangeCallback} = this.props;
    this.onToggle();

    onChangeCallback(address);
    this.clearFormField();
  };

  Screen = () => {
    const {
      handleSubmit,
      hasBillingAddress,
      countries,
      theme,
      disabled
    } = this.props;

    const {status, isKeyboardVisible} = this.state;

    let addressRefs = {};

    return (
      <ScrollView
        style={[{paddingBottom: 15}, isKeyboardVisible && {paddingBottom: 120}]}
        keyboardShouldPersistTaps="handled"
      >
        {!hasBillingAddress && !disabled && (
          <BaseSelect
            icon={'copy'}
            color={theme?.text?.fourthColor}
            leftIconSolid={false}
            values={t('customers.address.same_as')}
            valueStyle={{color: theme?.text?.primaryColor}}
            onChangeCallback={() => this.fillShippingAddress(!status)}
          />
        )}

        <Field
          name={'name'}
          component={BaseInput}
          hint={t('customers.address.name')}
          disabled={disabled}
        />

        <Field
          name={country}
          countries={countries}
          component={CountrySelectModal}
          onSelect={({id}) => this.setFormField(country, id)}
          reference={ref => (this.countryReference = ref)}
          theme={theme}
          disabled={disabled}
        />

        <Field
          name={state}
          component={BaseInput}
          hint={t('customers.address.state')}
          onSubmitEditing={() => addressRefs.city.focus()}
          disabled={disabled}
        />

        <Field
          name={city}
          component={BaseInput}
          hint={t('customers.address.city')}
          onSubmitEditing={() => addressRefs.street1.focus()}
          refLinkFn={ref => (addressRefs.city = ref)}
          disabled={disabled}
        />

        <Field
          name={'address_street_1'}
          component={BaseInput}
          hint={t('customers.address.address')}
          placeholder={t('customers.address.street_1')}
          inputProps={{
            multiline: true,
            maxLength: MAX_LENGTH
          }}
          height={60}
          refLinkFn={ref => (addressRefs.street1 = ref)}
          disabled={disabled}
        />

        <Field
          name={'address_street_2'}
          component={BaseInput}
          placeholder={t('customers.address.street_2')}
          inputProps={{
            multiline: true,
            maxLength: MAX_LENGTH
          }}
          height={60}
          containerStyle={styles.addressStreetField}
          disabled={disabled}
        />

        <Field
          name={'phone'}
          component={BaseInput}
          hint={t('customers.address.phone')}
          onSubmitEditing={() => addressRefs.zip.focus()}
          keyboardType={keyboardType.PHONE}
          refLinkFn={ref => (addressRefs.phone = ref)}
          disabled={disabled}
        />

        <Field
          name={'zip'}
          component={BaseInput}
          hint={t('customers.address.zip_code')}
          onSubmitEditing={handleSubmit(this.saveAddress)}
          refLinkFn={ref => (addressRefs.zip = ref)}
          disabled={disabled}
        />
      </ScrollView>
    );
  };

  render() {
    const {
      containerStyle,
      label,
      icon,
      placeholder,
      meta,
      rightIcon,
      hasBillingAddress,
      handleSubmit,
      baseSelectProps,
      theme,
      mainContainerStyle,
      disabled
    } = this.props;

    const {visible, values, isKeyboardVisible} = this.state;
    const bottomAction = [
      {
        label: 'button.done',
        onPress: handleSubmit(this.saveAddress),
        show: !isKeyboardVisible && !disabled
      }
    ];

    return (
      <View style={[styles.container(theme), mainContainerStyle]}>
        <BaseSelect
          label={label}
          icon={icon}
          rightIcon={rightIcon}
          values={values || placeholder}
          placeholder={placeholder}
          onChangeCallback={this.onToggle}
          containerStyle={containerStyle}
          meta={meta}
          {...baseSelectProps}
        />

        <SlideModal
          defaultLayout
          visible={visible}
          onToggle={this.onToggle}
          headerProps={{
            leftIconPress: () => this.onToggle(),
            title: hasBillingAddress
              ? t('header.billing_address')
              : t('header.shipping_address'),
            placement: 'center',
            hasCircle: false,
            noBorder: false,
            transparent: false
          }}
          bottomAction={<ActionButton buttons={bottomAction} />}
        >
          {this.Screen()}
        </SlideModal>
      </View>
    );
  }
}

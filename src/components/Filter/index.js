import React, {Component, Fragment} from 'react';
import {View, Modal, Keyboard} from 'react-native';
import {Field, reset, change} from 'redux-form';
import {AssetIcon} from '../AssetIcon';
import styles from './styles';
import {DefaultLayout} from '../Layouts';
import {InputField} from '../InputField';
import {SelectField} from '../SelectField';
import {DatePickerField} from '../DatePickerField';
import {ActionButton, CtDecorativeButton} from '../Button';
import t from 'locales/use-translation';
import {isIosPlatform, isAndroidPlatform} from '@/constants';
import {Text} from '../Text';
import {View as CtView} from '../View';
import {colors} from '@/styles';
import {BaseDropdownPicker} from '@/components';

type IProps = {
  visible: Boolean,
  onToggle: Function,
  onSubmitFilter: Function,
  headerProps: Object,
  inputFields: Object,
  dropdownFields: Object,
  selectFields: Object,
  datePickerFields: Object,
  onResetFilter: Function
};

export class Filter extends Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      counter: 0,
      isKeyboardVisible: false
    };
  }

  componentDidMount = () => {
    this.keyboardDidShowListener = Keyboard?.addListener?.(
      'keyboardDidShow',
      () => {
        !isIosPlatform && this.setState({isKeyboardVisible: true});
      }
    );
    this.keyboardDidHideListener = Keyboard?.addListener?.(
      'keyboardDidHide',
      () => {
        !isIosPlatform && this.setState({isKeyboardVisible: false});
      }
    );
  };

  componentWillUnmount = () => {
    this.keyboardDidShowListener?.remove?.();
    this.keyboardDidHideListener?.remove?.();
  };

  inputField = fields => {
    return fields.map((field, index) => {
      const {name, hint, inputProps} = field;
      return (
        <View key={index}>
          <Field
            name={name}
            component={InputField}
            hint={hint}
            inputProps={{
              ...inputProps
            }}
            {...field}
            leftIconStyle={field.leftIcon && styles.inputIconStyle}
          />
        </View>
      );
    });
  };

  selectField = fields => {
    const {counter} = this.state;

    return fields.map((field, index) => {
      const {name, items} = field;

      return (
        <View key={index}>
          <Field
            name={name}
            items={items}
            component={SelectField}
            hasFirstItem={counter > 0 ? false : true}
            {...field}
          />
        </View>
      );
    });
  };

  dropdownField = fields => {
    return fields.map((field, index) => {
      const {name, items} = field;

      return (
        <View key={index}>
          <Field
            name={name}
            component={BaseDropdownPicker}
            items={items}
            {...field}
          />
        </View>
      );
    });
  };

  datePickerField = fields => {
    return fields.map((field, index) => {
      const {name} = field;

      return (
        <Fragment key={index}>
          <CtView flex={1} justify-between>
            <Field
              name={name}
              component={DatePickerField}
              filter={true}
              {...field}
            />
          </CtView>
          {index === 0 && <CtView flex={0.07} />}
        </Fragment>
      );
    });
  };

  setFormField = (field, value) => {
    const {form, dispatch} = this.props.clearFilter;
    dispatch(change(form, field, value));
  };

  onToggleFilter = () => {
    this.setState(prevState => {
      return {visible: !prevState.visible};
    });
  };

  onSubmit = val => {
    let counter = 0;

    for (const key in val) {
      key !== 'search' && counter++;
    }

    this.setState({counter});

    this.onToggleFilter();

    this.props.onSubmitFilter?.();
  };

  onClear = () => {
    const {clearFilter, onResetFilter} = this.props;
    const {
      form,
      dispatch,
      formValues: {search}
    } = clearFilter;

    dispatch(reset(form));
    dispatch(change(form, 'search', search));

    this.setState({counter: 0});

    onResetFilter?.();
  };

  render() {
    const {
      headerProps,
      inputFields,
      dropdownFields,
      selectFields,
      datePickerFields,
      clearFilter: {handleSubmit},
      theme
    } = this.props;

    const {visible, counter, isKeyboardVisible} = this.state;

    const headerView = {
      title: t('header.filter'),
      placement: 'center',
      rightIcon: 'search',
      hasCircle: false,
      noBorder: false,
      transparent: false,
      leftIconPress: () => this.onToggleFilter(),
      rightIconPress: handleSubmit(this.onSubmit),
      ...(isAndroidPlatform && {
        containerStyle: {paddingTop: 60, height: 110}
      }),
      ...headerProps
    };

    const bottomAction = [
      {
        label: 'button.clear',
        onPress: this.onClear,
        type: 'btn-outline',
        show: !isKeyboardVisible
      },
      {
        label: 'search.title',
        onPress: handleSubmit(this.onSubmit),
        show: !isKeyboardVisible
      }
    ];

    return (
      <View>
        <CtDecorativeButton
          onPress={() => this.onToggleFilter()}
          activeOpacity={0.4}
          scale={0.95}
          justify-center
          items-center
          withHitSlop
          {...(this.props['is-small'] && {'pr-15': true})}
        >
          <AssetIcon
            name={'filter'}
            size={19}
            color={
              counter <= 0 && this.props['is-small']
                ? colors.darkGray
                : theme?.icons?.filter?.color
            }
            style={styles.filterIcon}
          />

          {counter > 0 && (
            <View style={styles.counter(theme, this.props['is-small'])}>
              <Text
                veryLightGray
                center
                style={styles.counterText(this.props['is-small'])}
              >
                {counter}
              </Text>
            </View>
          )}
        </CtDecorativeButton>

        <Modal
          animationType="slide"
          visible={visible}
          onRequestClose={() => this.onToggleFilter()}
          hardwareAccelerated={true}
          statusBarTranslucent={true}
        >
          <View style={styles.modalContainer}>
            <DefaultLayout
              headerProps={headerView}
              bottomAction={<ActionButton buttons={bottomAction} />}
              keyboardProps={{
                keyboardVerticalOffset: isIosPlatform ? 60 : 100
              }}
            >
              {selectFields && this.selectField(selectFields)}

              <CtView flex={1} flex-row mt-5>
                {datePickerFields && this.datePickerField(datePickerFields)}
              </CtView>

              {dropdownFields && this.dropdownField(dropdownFields)}

              {inputFields && this.inputField(inputFields)}
            </DefaultLayout>
          </View>
        </Modal>
      </View>
    );
  }
}

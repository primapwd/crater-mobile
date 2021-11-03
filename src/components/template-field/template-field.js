import React, {Component} from 'react';
import {TouchableOpacity, View} from 'react-native';
import styles from './styles';
import {Icon} from 'react-native-elements';
import {colors} from '@/styles';
import t from 'locales/use-translation';
import {IProps} from './type.d';
import {
  SlideModal,
  AssetImage,
  BaseSelect,
  BaseButtonGroup,
  BaseButton
} from '@/components';

export class TemplateField extends Component<IProps> {
  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      selectedTemplate: ''
    };
  }

  componentDidMount() {
    const {templates, input} = this.props;

    const selectedTemplate =
      templates && templates.filter(val => val.name === input?.value)?.[0];

    this.setState({selectedTemplate});
  }

  onToggle = () => {
    const {
      input: {value},
      templates,
      disabled
    } = this.props;
    const {selectedTemplate, visible} = this.state;

    if (disabled) {
      return;
    }

    if (visible && selectedTemplate?.name !== value) {
      const template = templates.filter(val => val.name === value)[0];
      this.setState({
        selectedTemplate: template
      });
    }

    this.setState({visible: !visible});
  };

  onTemplateSelect = template => {
    this.setState({
      selectedTemplate: template
    });
  };

  onSearch = search => {
    this.setState({search});
    this.getItems({fresh: true, q: search});
  };

  onSubmit = async () => {
    const {
      onChangeCallback,
      input: {onChange}
    } = this.props;

    const {selectedTemplate} = this.state;

    await onChange(selectedTemplate.name);

    onChangeCallback && onChangeCallback(selectedTemplate);

    this.onToggle();
  };

  render() {
    const {
      containerStyle,
      templates,
      label,
      icon,
      placeholder,
      meta,
      disabled,
      isRequired = false
    } = this.props;

    const {visible, selectedTemplate: {name} = {}} = this.state;
    const bottomAction = (
      <BaseButtonGroup>
        <BaseButton onPress={this.onSubmit}>
          {t('button.choose_template')}
        </BaseButton>
      </BaseButtonGroup>
    );

    return (
      <View style={styles.container}>
        <BaseSelect
          label={label}
          icon={icon}
          values={name}
          isRequired={isRequired}
          placeholder={placeholder}
          onChangeCallback={this.onToggle}
          containerStyle={containerStyle}
          disabled={disabled}
          meta={meta}
        />

        <SlideModal
          visible={visible}
          onToggle={this.onToggle}
          headerProps={{
            leftIconPress: () => this.onToggle(),
            title: t('header.template'),
            placement: 'center',
            hasCircle: false,
            noBorder: false,
            transparent: false
          }}
          bottomDivider
          defaultLayout
          bottomAction={bottomAction}
        >
          <View style={styles.imageList}>
            {templates &&
              templates.map((val, index) => (
                <TouchableOpacity
                  onPress={() => this.onTemplateSelect(val)}
                  key={index}
                  activeOpacity={0.7}
                >
                  <View style={styles.imageContainer}>
                    <AssetImage
                      uri
                      source={val.path}
                      style={[styles.image, name === val.name && styles.active]}
                    />
                    {name === val.name && (
                      <Icon
                        name="check"
                        size={18}
                        iconStyle={styles.iconStyle}
                        color={colors.white}
                        containerStyle={styles.iconContainer}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        </SlideModal>
      </View>
    );
  }
}

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewPropTypes,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
  containerDefault: {},
  cellDefault: {
    borderColor: 'gray',
    borderWidth: 1,
  },
  cellFocusedDefault: {
    borderColor: 'black',
    borderWidth: 2,
  },
  textStyleDefault: {
    color: 'black',
    fontSize: 27,
    fontWeight: 'bold',
  },
  textStyleFocusedDefault: {
    color: 'black',
  },
});

class SmoothPinCodeInput extends Component {

  state = {
    maskDelay: false,
    focused: false,
  };

  ref = React.createRef();

  inputRef = React.createRef();

  constructor(props) {
    super(props);
    this.timers = [];
  }

  componentWillUnmount() {
    for (let i = 0; i < this.timers.length; i += 1) {
      clearTimeout(this.timers[i]);
    }
  }

  shake = () => {
    return this.ref.current.shake(650);
  };

  focus = () => {
    return this.inputRef.current.focus();
  };

  blur = () => {
    return this.inputRef.current.blur();
  };

  _inputCode = (code) => {
    const { password, codeLength = 4, onTextChange, onFulfill } = this.props;

    if (onTextChange) {
      onTextChange(code);
    }
    if (code.length === codeLength && onFulfill) {
      onFulfill(code);
    }

    // handle password mask
    const maskDelay = password &&
      code.length - 1 > this.props.value.length; // only when input new char
    this.setState({ maskDelay });

    if (maskDelay) { // mask password after delay
      this.timers.push(setTimeout(() => this.setState({ maskDelay: false }), 200));
    }
  };

  _keyPress = (event) => {
    if (event.nativeEvent.key === 'Backspace') {
      const { value, onBackspace } = this.props;
      if (value === '' && onBackspace) {
        onBackspace();
      }
    }
  };


  _onFocused = (focused) => {
    this.setState({ focused });
  };

  render() {
    const {
      value,
      codeLength, cellSize, cellSpacing,
      placeholder,
      password,
      mask,
      autoFocus,
      containerStyle,
      cellStyle,
      cellStyleFocused,
      textStyle,
      textStyleFocused,
      keyboardType,
      animationFocused,
      onSubmitEditing,
    } = this.props;
    const { maskDelay, focused } = this.state;
    return (
      <Animatable.View
        ref={this.ref}
        style={[{
          alignItems: 'stretch',
          flexDirection: 'row',
          justifyContent: 'center',
          position: 'relative',
          width: cellSize * codeLength + cellSpacing * (codeLength - 1),
          height: cellSize,
        },
          containerStyle,
        ]}>
        <View style={{
          position: 'absolute',
          margin: 0,
          height: '100%',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          {
            Array.apply(null, Array(codeLength))
              .map((_, idx) => {
                const cellFocused = focused && idx === value.length;
                const filled = idx < value.length;
                const last = idx == value.length - 1;

                return (
                  <Animatable.View key={idx}
                                   style={[
                                     cellStyle,
                                     cellFocused ? cellStyleFocused : {},
                                     {
                                       width: cellSize,
                                       height: cellSize,
                                       marginLeft: cellSpacing / 2,
                                       marginRight: cellSpacing / 2,
                                       flexDirection: 'row',
                                       alignItems: 'center',
                                       justifyContent: 'center',
                                     }
                                   ]}
                                   animation={idx === value.length && focused ? animationFocused : null}
                                   iterationCount="infinite"
                                   duration={500}
                  >
                    <Text
                      style={[
                        textStyle,
                        cellFocused ? textStyleFocused : {},
                      ]}>
                      {filled &&
                      (password && (!maskDelay || !last)) ? mask : value.charAt(idx)
                      }
                      {!filled &&
                      placeholder
                      }
                    </Text>
                  </Animatable.View>
                );
              })
          }
        </View>
        <TextInput
          {...this.props}
          value={value}
          ref={this.inputRef}
          onChangeText={this._inputCode}
          onKeyPress={this._keyPress}
          onFocus={() => this._onFocused(true)}
          onBlur={() => this._onFocused(false)}
          spellCheck={false}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          numberOfLines={1}
          maxLength={codeLength}
          style={{
            flex: 1,
            opacity: 0,
            textAlign: 'center',
          }}
          onSubmitEditing={onSubmitEditing}
        />
      </Animatable.View>
    );
  }
}

SmoothPinCodeInput.propTypes = {
  value: PropTypes.string,
  codeLength: PropTypes.number,
  cellSize: PropTypes.number,
  cellSpacing: PropTypes.number,

  placeholder: PropTypes.string,
  mask: PropTypes.string,
  password: PropTypes.bool,

  autoFocus: PropTypes.bool,

  containerStyle: ViewPropTypes.style,

  cellStyle: ViewPropTypes.style,
  cellStyleFocused: ViewPropTypes.style,

  textStyle: Text.propTypes.style,
  textStyleFocused: Text.propTypes.style,

  animationFocused: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),

  onFulfill: PropTypes.func.isRequired,
  onChangeText: PropTypes.func,
  onBackspace: PropTypes.func,
  onSubmitEditing: PropTypes.func,

  keyboardType: PropTypes.string,
};

SmoothPinCodeInput.defaultProps = {
  value: '',
  codeLength: 4,
  cellSize: 48,
  cellSpacing: 4,
  placeholder: '',
  password: false,
  mask: '*',
  keyboardType: 'numeric',
  autoFocus: false,
  containerStyle: styles.containerDefault,
  cellStyle: styles.cellDefault,
  cellStyleFocused: styles.cellFocusedDefault,
  textStyle: styles.textStyleDefault,
  textStyleFocused: styles.textStyleFocusedDefault,
  animationFocused: 'pulse',
  onChangeText: () => null,
  onBackspace: () => null,
  onSubmitEditing: () => null,
};

export default SmoothPinCodeInput;

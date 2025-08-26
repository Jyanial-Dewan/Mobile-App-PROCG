import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import SVGController from './SVGController';
interface Props {
  handleSend: () => void;
  isSending: boolean;
  disabled: boolean;
  style: any;
}

const FooterSendButton = ({handleSend, isSending, disabled, style}: Props) => {
  return (
    <>
      <TouchableOpacity onPress={handleSend} style={style} disabled={disabled}>
        {isSending ? (
          <ActivityIndicator
            size={24}
            color="white"
            style={styles.loadingStyle}
          />
        ) : (
          <SVGController name="Send" color="white" />
        )}
      </TouchableOpacity>
    </>
  );
};

export default FooterSendButton;

const styles = StyleSheet.create({
  loadingStyle: {transform: [{scaleX: 0.8}, {scaleY: 0.8}]},
});

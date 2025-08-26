import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import SVGController from './SVGController';
interface Props {
  handleDraft: () => void;
  isDrafting?: boolean;
  disabled?: boolean;
  style?: any;
}
const FooterDraftButton = ({
  handleDraft,
  isDrafting,
  disabled,
  style,
}: Props) => {
  return (
    <>
      <TouchableOpacity onPress={handleDraft} disabled={disabled} style={style}>
        {isDrafting ? (
          <ActivityIndicator
            size={24}
            color="white"
            style={styles.loadingStyle}
          />
        ) : (
          <SVGController name="Notebook-Pen" color="white" />
        )}
      </TouchableOpacity>
    </>
  );
};

export default FooterDraftButton;

const styles = StyleSheet.create({
  loadingStyle: {transform: [{scaleX: 0.8}, {scaleY: 0.8}]},
});

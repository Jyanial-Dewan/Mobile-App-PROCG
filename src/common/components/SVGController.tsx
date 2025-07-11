import {StyleSheet, View} from 'react-native';
import React, {Fragment} from 'react';
import {COLORS} from '../constant/Themes';
import BellIcon from '../../assets/Icons/bell.svg';
import UserIcon from '../../assets/Icons/user.svg';
import SettingIcon from '../../assets/Icons/settings.svg';
import KeyIcon from '../../assets/Icons/key-round.svg';
import SecurityIcon from '../../assets/Icons/shield-ban.svg';
import LogoutIcon from '../../assets/Icons/log-out.svg';
import MenuIcon from '../../assets/Icons/menu.svg';
import HomeIcon from '../../assets/Icons/house.svg';
import ActionItemsIcon from '../../assets/Icons/list-todo.svg';
import MailIcon from '../../assets/Icons/mail.svg';
import ChevronDownIcon from '../../assets/Icons/chevron-down.svg';
import ChevronUpIcon from '../../assets/Icons/chevron-up.svg';
import ChevronRightIcon from '../../assets/Icons/chevron-right.svg';
import ChevronLeftIcon from '../../assets/Icons/chevron-left.svg';
import SendIcon from '../../assets/Icons/send.svg';
import ScanTextIcon from '../../assets/Icons/scan-text.svg';
import CombineIcon from '../../assets/Icons/combine.svg';
import NotebookPen from '../../assets/Icons/notebook-pen.svg';
import ArrowLeftIcon from '../../assets/Icons/arrow-left.svg';
import PlusIcon from '../../assets/Icons/plus.svg';
import QRIcon from '../../assets/Icons/qr.svg';
import SearchIcon from '../../assets/Icons/search.svg';
import CheckIcon from '../../assets/Icons/check.svg';
import TrashIcon from '../../assets/Icons/trash.svg';
import TrashIcon2 from '../../assets/Icons/trash-2.svg';
import CircleCheckBig from '../../assets/Icons/circle-check-big.svg';
import CircleCheck from '../../assets/Icons/circle-check.svg';
import Circle from '../../assets/Icons/circle.svg';
import CircleChevronDown from '../../assets/Icons/circle-chevron-down.svg';
import CircleChevronRight from '../../assets/Icons/circle-chevron-right.svg';
import CircleDot from '../../assets/Icons/circle-dot.svg';

interface SVGControllerProps {
  name: string;
  height?: number;
  width?: number;
  color?: string;
}

const SVGController = ({
  name,
  height = 24,
  width = 24,
  color = COLORS.newGray,
}: SVGControllerProps) => {
  const getSVGImage = (
    svgName: string,
    width: number,
    height: number,
    color: string,
  ): any => {
    switch (svgName) {
      case 'Bell':
        return <BellIcon width={width} height={height} color={color} />;
      case 'User':
        return <UserIcon width={width} height={height} color={color} />;
      case 'Settings':
        return <SettingIcon width={width} height={height} color={color} />;
      case 'Key':
        return <KeyIcon width={width} height={height} color={color} />;
      case 'Security':
        return <SecurityIcon width={width} height={height} color={color} />;
      case 'Logout':
        return <LogoutIcon width={width} height={height} color={color} />;
      case 'Menu':
        return <MenuIcon width={width} height={height} color={color} />;
      case 'Mail':
        return <MailIcon width={width} height={height} color={color} />;
      case 'List':
        return <ActionItemsIcon width={width} height={height} color={color} />;
      case 'Home':
        return <HomeIcon width={width} height={height} color={color} />;
      case 'Arrow-Left':
        return <ArrowLeftIcon width={width} height={height} color={color} />;
      case 'Send':
        return <SendIcon width={width} height={height} color={color} />;
      case 'Notebook-Pen':
        return <NotebookPen width={width} height={height} color={color} />;
      case 'Combine':
        return <CombineIcon width={width} height={height} color={color} />;
      case 'Scan-Text':
        return <ScanTextIcon width={width} height={height} color={color} />;
      case 'Chevron-Down':
        return <ChevronDownIcon width={width} height={height} color={color} />;
      case 'Chevron-Up':
        return <ChevronUpIcon width={width} height={height} color={color} />;
      case 'Chevron-Right':
        return <ChevronRightIcon width={width} height={height} color={color} />;
      case 'Chevron-Left':
        return <ChevronLeftIcon width={width} height={height} color={color} />;
      case 'Plus':
        return <PlusIcon width={width} height={height} color={color} />;
      case 'QR':
        return <QRIcon width={width} height={height} color={color} />;
      case 'SEARCH':
        return <SearchIcon width={width} height={height} color={color} />;
      case 'Check':
        return <CheckIcon width={width} height={height} color={color} />;
      case 'move to Recycle Bin':
        return <TrashIcon width={width} height={height} color={color} />;
      case 'delete permanently':
        return <TrashIcon2 width={width} height={height} color={color} />;
      case 'Circle-Check-Big':
        return <CircleCheckBig width={width} height={height} color={color} />;
      case 'Circle-Check':
        return <CircleCheck width={width} height={height} color={color} />;
      case 'Circle':
        return <Circle width={width} height={height} color={color} />;
      case 'Circle-Chevron-Down':
        return (
          <CircleChevronDown width={width} height={height} color={color} />
        );
      case 'Circle-Chevron-Right':
        return (
          <CircleChevronRight width={width} height={height} color={color} />
        );
      case 'Circle-Dot':
        return <CircleDot width={width} height={height} color={color} />;

      default:
        return <BellIcon width={width} height={height} color={color} />;
    }
  };
  return (
    <Fragment>
      <View style={styles.container}>
        {getSVGImage(name, height, width, color)}
      </View>
    </Fragment>
  );
};

export default SVGController;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.transparent,
    borderRadius: 100,
  },
});

import {X} from 'lucide-react-native';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

const {width} = Dimensions.get('window');

type ListProps = {
  item: {
    name: string;
    title: string;
  };
};

type CustomDrawer = {
  isBottomSheetOpen: boolean;
  handleOpenBottomSheet: () => void;
  handleCloseBottomSheet: () => void;
  data: ListProps['item'];
};
const MainDrawer = (props: CustomDrawer) => {
  const {
    isBottomSheetOpen,
    handleCloseBottomSheet,
    handleOpenBottomSheet,
    data,
  } = props;
  const windowHeight = Dimensions.get('window').height;

  return (
    <Modal
      testID="modal"
      isVisible={isBottomSheetOpen}
      swipeDirection={['down']}
      swipeThreshold={100}
      onSwipeCancel={handleCloseBottomSheet}
      style={styles.view}>
      <View style={[styles.content, {width: width}]}>
        <View
          style={{
            flex: 0,
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <Text>{data.title}</Text>
          <TouchableOpacity onPress={handleCloseBottomSheet}>
            <X />
          </TouchableOpacity>
        </View>
        <View style={{paddingVertical: 16}}>
          <Text>{data.name}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default MainDrawer;

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});

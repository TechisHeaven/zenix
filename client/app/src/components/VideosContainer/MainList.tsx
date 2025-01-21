import {useNavigation} from '@react-navigation/native';
import {EllipsisVertical} from 'lucide-react-native';
import {Ref, RefObject, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MainDrawer from '../Drawer/MainDrawer';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../types/navigation.type';

type ListProps = {
  item: {
    name: string;
    title: string;
    thumbnail: string;
  };
  scrollRef?: RefObject<ScrollView | null>;
};
export default function List(props: ListProps) {
  const {item, scrollRef} = props;
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, 'Video'>>();

  // This state would determine if the drawer sheet is visible or not
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Function to open the bottom sheet
  const handleOpenBottomSheet = () => {
    setIsBottomSheetOpen(true);
  };

  // Function to close the bottom sheet
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  const handleNavigate = () => {
    // Check if the current route is already active
    navigation.navigate('Video', {video: item});
    scrollRef?.current?.scrollTo({y: 0, animated: true});
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleNavigate}>
      <Image
        style={styles.thumbnail}
        src={
          'https://imgs.search.brave.com/pEOlTyNSkZpXVfHbHSkWDjjNE7GTxXKFM0GsNUZinQY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM2/OTE5OTM2MC9waG90/by9wb3J0cmFpdC1v/Zi1hLWhhbmRzb21l/LXlvdW5nLWJ1c2lu/ZXNzbWFuLXdvcmtp/bmctaW4tb2ZmaWNl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz11anlHZHU4aktJ/MlVCNTUxNVhaQTMz/VHQ0REJoRFUxOWRL/U1RVVE1adnJnPQ'
        }
      />
      <View style={styles.mainContainer}>
        <View style={styles.infoContainer}>
          <Image
            src={
              'https://imgs.search.brave.com/pEOlTyNSkZpXVfHbHSkWDjjNE7GTxXKFM0GsNUZinQY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM2/OTE5OTM2MC9waG90/by9wb3J0cmFpdC1v/Zi1hLWhhbmRzb21l/LXlvdW5nLWJ1c2lu/ZXNzbWFuLXdvcmtp/bmctaW4tb2ZmaWNl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz11anlHZHU4aktJ/MlVCNTUxNVhaQTMz/VHQ0REJoRFUxOWRL/U1RVVE1adnJnPQ'
            }
            style={styles.avatar}
          />
          <View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="clip">
              {item.title}
            </Text>
            <Text style={styles.subtitle}>{item.name}</Text>
            <View style={styles.videoInfoContainer}>
              <Text style={styles.subtitle}>12M</Text>
              <Text style={styles.subtitle}>2 Days</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleOpenBottomSheet}>
          <EllipsisVertical size={18} color={'gray'} />
        </TouchableOpacity>
      </View>
      <MainDrawer
        data={{...item}}
        handleOpenBottomSheet={handleOpenBottomSheet}
        handleCloseBottomSheet={handleCloseBottomSheet}
        isBottomSheetOpen={isBottomSheetOpen}
      />
    </TouchableOpacity>
  );
}

const {width} = Dimensions.get('window');
const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    width: width,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 25,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'red',
  },
  container: {padding: 12},
  infoContainer: {
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContainer: {
    flexDirection: 'row',
    padding: 18,
    justifyContent: 'space-between',
  },
  videoInfoContainer: {flexDirection: 'row', gap: 12},
  thumbnail: {
    width,
    height: 200,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 24,
  },
  title: {
    color: 'white',
    fontSize: 16,
    maxWidth: width - 140,
  },
  subtitle: {
    color: 'gray',
    fontSize: 12,
  },
});

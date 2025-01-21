import {RouteProp} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Share as NativeShare,
} from 'react-native';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import {Share, ThumbsDown, ThumbsUp} from 'lucide-react-native';
import VideoRecommendedList from '../../components/VideosContainer/VideoRecommendedList';

const {width} = Dimensions.get('window');

type RootStackParamList = {
  Video: {
    video: {
      title: string;
      name: string;
      thumbnail: string;
    };
  };
};

// Define the route prop type
type VideoScreenRouteProp = RouteProp<RootStackParamList, 'Video'>;

type VideoProps = {
  route: VideoScreenRouteProp;
};

export default function Video({route}: VideoProps) {
  const {video} = route.params;
  const scrollRef = useRef<ScrollView | null>(null);

  // State for like and dislike
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Handle like
  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
      setLiked(false);
    } else {
      setLikes(prev => prev + 1);
      if (disliked) {
        setDislikes(prev => prev - 1);
        setDisliked(false);
      }
      setLiked(true);
    }
  };

  // Handle dislike
  const handleDislike = () => {
    if (disliked) {
      setDislikes(prev => prev - 1);
      setDisliked(false);
    } else {
      setDislikes(prev => prev + 1);
      if (liked) {
        setLikes(prev => prev - 1);
        setLiked(false);
      }
      setDisliked(true);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      await NativeShare.share({
        message: `Check out this video: ${video.title}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView ref={scrollRef}>
      <View>
        <VideoPlayer />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="clip">
          {video.title}
        </Text>
        <View style={styles.videoInfoContainer}>
          <Text style={styles.subtitle}>12M Views</Text>
          <Text style={styles.subtitle}>2 Days</Text>
        </View>
        <TouchableOpacity style={styles.channelContainer}>
          <Image
            src={
              'https://imgs.search.brave.com/pEOlTyNSkZpXVfHbHSkWDjjNE7GTxXKFM0GsNUZinQY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTM2/OTE5OTM2MC9waG90/by9wb3J0cmFpdC1v/Zi1hLWhhbmRzb21l/LXlvdW5nLWJ1c2lu/ZXNzbWFuLXdvcmtp/bmctaW4tb2ZmaWNl/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz11anlHZHU4aktJ/MlVCNTUxNVhaQTMz/VHQ0REJoRFUxOWRL/U1RVVE1adnJnPQ'
            }
            style={styles.avatar}
          />
          <Text style={styles.channel}>{video.name}</Text>
        </TouchableOpacity>
        <View style={styles.engagementContainer}>
          <View
            style={[styles.engagementButton, {flexDirection: 'row', gap: 12}]}>
            <TouchableOpacity onPress={handleLike}>
              <ThumbsUp color={liked ? 'blue' : 'white'} size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDislike}>
              <ThumbsDown color={disliked ? 'blue' : 'white'} size={18} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.engagementButton}>
            <Share color="white" size={18} />
          </TouchableOpacity>
        </View>
      </View>
      <VideoRecommendedList scrollRef={scrollRef} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  channelContainer: {flexDirection: 'row', alignItems: 'center', gap: 12},
  engagementContainer: {flexDirection: 'row', gap: 12},
  engagementButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: 'gray',
    borderRadius: 188,
  },
  infoContainer: {
    gap: 12,
    padding: 12,
    flexDirection: 'column',
  },
  videoInfoContainer: {flexDirection: 'row', gap: 12},
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 24,
  },
  thumbnail: {
    width,
    height: 200,
  },
  title: {
    color: 'white',
    fontSize: 18,
    maxWidth: width - 140,
    textTransform: 'capitalize',
  },
  subtitle: {
    color: 'gray',
    fontSize: 12,
  },
  channel: {
    color: 'white',
    fontSize: 16,
  },
});

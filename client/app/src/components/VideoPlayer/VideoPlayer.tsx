import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import {useFocusEffect} from '@react-navigation/native';
import {Text} from 'react-native';
import {
  Forward,
  Maximize,
  Minimize,
  MoveLeft,
  MoveRight,
  Pause,
  Play,
  Repeat,
  ReplyAll,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeOff,
} from 'lucide-react-native';

const VideoPlayer = () => {
  const videoRef = useRef<VideoRef>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Track dragging state
  const [dragX, setDragX] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const background =
    'https://static.vecteezy.com/system/resources/previews/003/667/698/mp4/beautiful-female-solar-engineer-standing-near-the-panels-and-a-young-specialist-in-the-background-tests-the-batteries-concept-of-green-electricity-video.mp4';

  const progressBarWidth = isFullScreen ? width - 40 : width - 80;
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDragging(true),
    onPanResponderMove: (_, gestureState) => {
      const newDragX = Math.max(
        0,
        Math.min(progressBarWidth, dragX + gestureState.dx),
      );
      setDragX(newDragX);
    },
    onPanResponderRelease: () => {
      const newTime = (dragX / progressBarWidth) * duration;
      videoRef.current?.seek(newTime);
      setCurrentTime(newTime);
      setIsDragging(false);
    },
  });

  // const background = require('../../assets/test1.mp4');
  const videoSource = useMemo(() => background, [background]);

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    isFullScreen ? Orientation.lockToPortrait() : Orientation.lockToLandscape();
  };

  const skipForward = () => {
    videoRef.current?.seek(currentTime + 5);
  };

  const skipBackward = () => {
    videoRef.current?.seek(Math.max(0, currentTime - 5));
  };

  const playNextVideo = () => {
    videoRef.current?.seek(0); // Reset current video to start
    setCurrentTime(0);
    // Replace with logic to load the next video
    console.log('Next video loaded.');
  };

  const playPrevVideo = () => {
    videoRef.current?.seek(0); // Reset current video to start
    setCurrentTime(0);
    // Replace with logic to load the previous video
    console.log('Previous video loaded.');
  };
  // Handle Full-Screen Enter
  const onFullScreenEnter = () => {
    setIsFullScreen(true);
    Orientation.lockToLandscape();
  };

  // Handle Full-Screen Exit
  const onFullScreenExit = () => {
    setIsFullScreen(false);
    Orientation.lockToPortrait();
  };

  // Callback when video is buffering
  const onBuffer = (e: any) => {
    console.log('Buffering...', e);
    if (!isVideoReady) {
      setIsLoading(e.isBuffering); // Only update loading if video isn't ready
    } // Show loader when buffering
    setIsVideoCompleted(false);
  };
  //  On Ready for Display
  const onReadyForDisplay = () => {
    console.log('Video ready for display');
    setIsLoading(false);
    setIsVideoReady(true); // Hide loader when video is ready to display
  };
  // Callback when video starts loading
  const onLoad = (data: {duration: number}) => {
    console.log('Video loaded');
    setIsLoading(false);
    setDuration(data.duration);
    setIsVideoCompleted(false); // Reset completion state when video loads
  };

  const onEnd = () => {
    setIsVideoCompleted(true); // Show repeat button when video ends
    setCurrentTime(duration); // Ensure progress bar is full
  };

  const handleRepeat = () => {
    setIsVideoCompleted(false); // Reset completion state
    videoRef.current?.seek(0); // Restart video from the beginning
    setIsPaused(false); // Ensure the video starts playing
  };

  // Callback when video encounters an error
  const onError = (e: any) => {
    console.log('Error:', e);
    setIsLoading(false); // Hide loader on error
  };

  const onExternalPlaybackChange = (e: any) => {
    console.log('onExternalPlaybackChange', e);
    Orientation.lockToPortrait();
  };

  const togglePause = () => setIsPaused(!isPaused);

  // Toggles mute/unmute
  const toggleMute = () => setIsMuted(!isMuted);

  const handleControls = () => {
    setShowControls(true);
    setTimeout(() => {
      setShowControls(false);
    }, 3000); // Auto-hide controls after 3 seconds
  };
  const onProgress = (data: {currentTime: number}) => {
    if (!isDragging) {
      setCurrentTime(data.currentTime);
      setDragX((data.currentTime / duration) * progressBarWidth);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Lock to portrait when leaving the video screen
      return () => {
        Orientation.lockToPortrait();
      };
    }, []),
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleDoubleClick = (side: 'left' | 'right') => {
    const now = Date.now();
    const delta = now - lastTap;

    if (delta < 300) {
      if (side === 'left') {
        videoRef.current?.seek(currentTime - 2);
      } else if (side === 'right') {
        videoRef.current?.seek(currentTime + 2);
      }
    }

    setLastTap(now);
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      <Video
        key={'video-player'}
        source={{
          uri: videoSource,
        }}
        // source={videoSource}
        ref={videoRef}
        paused={isPaused}
        muted={isMuted}
        onProgress={onProgress}
        onBuffer={onBuffer}
        onLoad={onLoad}
        onReadyForDisplay={onReadyForDisplay}
        onError={onError}
        onEnd={onEnd}
        onExternalPlaybackChange={onExternalPlaybackChange}
        style={styles.backgroundVideo}
        controls={false}
        fullscreen={isFullScreen}
        onFullscreenPlayerDidPresent={onFullScreenEnter}
        onFullscreenPlayerDidDismiss={onFullScreenExit}
        resizeMode="contain"
        rate={1.0} // Normal playback speed
        maxBitRate={5000000}
      />
      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.topControls}>
            <TouchableOpacity onPress={playPrevVideo}>
              <SkipBack size={32} color="#fff" />
            </TouchableOpacity>
            {isVideoCompleted ? (
              <View style={styles.repeatContainer}>
                <TouchableOpacity onPress={handleRepeat}>
                  <Repeat size={32} color="#fff" />
                  <Text style={styles.repeatText}>Repeat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={togglePause}>
                {isPaused ? (
                  <Play size={32} color="#fff" />
                ) : (
                  <Pause size={32} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            {isFullScreen && (
              <TouchableOpacity
                onPress={toggleMute}
                style={styles.controlButton}>
                {isMuted ? (
                  <VolumeOff size={32} color="#fff" />
                ) : (
                  <Volume2 size={32} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={playNextVideo}>
              <SkipForward size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  {width: dragX}, // Dynamic width based on drag position
                ]}
              />
              <View
                {...panResponder.panHandlers}
                style={[
                  styles.progressThumb,
                  {left: dragX - 20}, // Center the thumb
                ]}
              />
            </View>
            <Text style={styles.time}>{formatTime(duration)}</Text>
            <TouchableOpacity
              style={styles.fullScreenButton}
              onPress={handleFullScreen}>
              {isFullScreen ? (
                <Maximize size={24} color="#fff" />
              ) : (
                <Minimize size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.leftTouchableArea}
            onPress={() => handleDoubleClick('left')}></TouchableOpacity>
          <TouchableOpacity
            style={styles.rightTouchableArea}
            onPress={() => handleDoubleClick('right')}></TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default VideoPlayer;

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  backgroundVideo: {
    width,
    height: 200,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    zIndex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: '50%',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
    padding: 10,
    margin: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#666',
    marginHorizontal: 10,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    top: -8, // Center the thumb vertically
    zIndex: 2,
  },
  time: {
    color: '#fff',
    fontSize: 12,
  },
  repeatContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  repeatText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  leftTouchableArea: {
    position: 'absolute',
    left: 0,
    width: '20%',
    bottom: 30,
    height: '100%',
  },
  rightTouchableArea: {
    position: 'absolute',
    right: 0,
    bottom: 30,
    width: '20%',
    height: '100%',
  },
  fullScreenButton: {padding: 12},
});

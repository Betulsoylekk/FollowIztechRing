import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Platform,
  FlatList,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from 'react-native-maps';
import {useNavigation} from '@react-navigation/native';
import {WINDOW_HEIGHT} from '../../utils';
import Icon from 'react-native-vector-icons/FontAwesome5';
import getPath from '../../helpers/GetPath';

const BOTTOM_SHEET_MAX_HEIGHT = WINDOW_HEIGHT * 0.6;
const BOTTOM_SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.1;
const MAX_UPWARD_TRANSLATE_Y =
  BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT; // negative number;
const MAX_DOWNWARD_TRANSLATE_Y = 0;
const DRAG_THRESHOLD = 50;

const MapScreen = () => {
  const navigation = useNavigation();

  const animatedValue = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        animatedValue.setOffset(lastGestureDy.current);
      },
      onPanResponderMove: (e, gesture) => {
        animatedValue.setValue(gesture.dy);
      },
      onPanResponderRelease: (e, gesture) => {
        animatedValue.flattenOffset();
        lastGestureDy.current += gesture.dy;
        if (gesture.dy > 0) {
          // dragging down
          if (gesture.dy <= DRAG_THRESHOLD) {
            springAnimation('up');
          } else {
            springAnimation('down');
          }
        } else {
          // dragging up
          if (gesture.dy >= -DRAG_THRESHOLD) {
            springAnimation('down');
          } else {
            springAnimation('up');
          }
        }
      },
    }),
  ).current;

  const springAnimation = (direction: 'up' | 'down') => {
    console.log('direction', direction);
    lastGestureDy.current =
      direction === 'down' ? MAX_DOWNWARD_TRANSLATE_Y : MAX_UPWARD_TRANSLATE_Y;
    Animated.spring(animatedValue, {
      toValue: lastGestureDy.current,
      useNativeDriver: true,
    }).start();
  };

  const bottomSheetAnimation = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
          outputRange: [MAX_UPWARD_TRANSLATE_Y, MAX_DOWNWARD_TRANSLATE_Y],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  // Identify the stops
  const [busStops, setBusStops] = useState([
    {latitude: 38.318349, longitude: 26.643567},
    {latitude: 38.316639, longitude: 26.641265},
    {latitude: 38.316031, longitude: 26.640011},
    {latitude: 38.3162, longitude: 26.638158},
    {latitude: 38.317667, longitude: 26.638506},
    {latitude: 38.319092, longitude: 26.638841},
    {latitude: 38.320428, longitude: 26.639147},
    {latitude: 38.323398, longitude: 26.639834},
    {latitude: 38.323908, longitude: 26.637552},
    {latitude: 38.324648, longitude: 26.635303},
    {latitude: 38.325228, longitude: 26.632637},
    {latitude: 38.324181, longitude: 26.632467},
    {latitude: 38.322756, longitude: 26.632144},
    {latitude: 38.323745, longitude: 26.630919},
    {latitude: 38.318315, longitude: 26.641673},
    // {latitude: 38.319226, longitude: 26.642514},
    // {latitude: 38.319446, longitude: 26.642733},
    {latitude: 38.319572, longitude: 26.643062},
  ]);

  const [busLocation, setBusLocation] = useState({
    latitude: 38.319226,
    longitude: 26.642514,
    // latitude: 38.319226,
    // longitude: 26.642514,
  });

  const [path, setPath] = useState([]);

  const flatListData = [
    {key: '1', text: 'Rektörlük Durağı', time: '5'},
    {key: '2', text: 'Makina Mühendisliği Bölümü Durağı', time: '7'},
    {key: '3', text: 'Yabancı Diller Durağı', time: '9'},
    {key: '4', text: 'Kimya Mühendisliği Bölümü Durağı', time: '12'},
    {key: '5', text: 'EHM Durağı', time: '13'},
    {key: '6', text: 'Kütüphane Durağı', time: '15'},
    {key: '7', text: 'Spor Salonu Durağı', time: '18'},
    {key: '8', text: 'AFAD Yurdu Durağı', time: '23'},
    {key: '9', text: 'KYK Yurdu Durağı', time: '26'},
    {key: '11', text: 'Yurtlar Durağı', time: '28'},
    {key: '12', text: 'Biyoloji Bölümü Durağı', time: '32'},
    {key: '13', text: 'Matematik Bölümü Durağı', time: '34'},
    {key: '14', text: 'Mimarlık Fakültesi Durağı', time: '40'},
  ];

  const renderItem = ({item, index}) => (
    <View>
      {index === 0 && (
        <>
          <View style={styles.listContainer}>
            <Text style={styles.stop}>
              {'Hareket Yeri: '}
              {item.text}
            </Text>
            <View style={styles.row}>
              <Icon name="bus-alt" size={20} color="#000" style={styles.icon} />
              <Text style={styles.info}>
                {item.time}
                {'dk'}
              </Text>
            </View>
          </View>
          <View style={styles.separator} />
        </>
      )}

      {index !== 0 && (
        <>
          <View style={styles.listContainer}>
            <Text style={styles.stop}>{item.text}</Text>
            <View style={styles.row}>
              <Icon name="bus-alt" size={20} color="#000" style={styles.icon} />
              <Text style={styles.info}>
                {item.time}
                {'dk'}
              </Text>
            </View>
          </View>
          <View style={styles.separator} />
        </>
      )}
    </View>
  );

  useEffect(() => {
    getPath('38.3183515,26.6435979', '38.3242134,26.6310109')
      .then(coords => setPath(coords))
      .catch(err => console.log('Error! Something went wrong.'));
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={
          Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        initialRegion={{
          latitude: 38.3192722,
          longitude: 26.6364812,
          latitudeDelta: 0.012,
          longitudeDelta: 0.0154,
        }}>
        {path.length > 0 && (
          <Polyline coordinates={path} strokeWidth={7} strokeColor="#6495ED" />
        )}
        {busStops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={stop}
            icon={require('../../assets/images/stop.png')}
          />
        ))}
        <Marker
          coordinate={busLocation}
          icon={require('../../assets/images/ring.png')}
        />
      </MapView>

      <Animated.View style={[styles.bottomSheet, bottomSheetAnimation]}>
        <View style={styles.draggableArea} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>
        <View style={styles.list}>
          <FlatList
            data={flatListData}
            renderItem={renderItem}
            keyExtractor={item => item.key}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    width: '100%',
    height: BOTTOM_SHEET_MAX_HEIGHT,
    bottom: BOTTOM_SHEET_MIN_HEIGHT - BOTTOM_SHEET_MAX_HEIGHT,
    ...Platform.select({
      android: {elevation: 3},
      ios: {
        shadowColor: '#a8bed2',
        shadowOpacity: 1,
        shadowRadius: 6,
        shadowOffset: {
          width: 2,
          height: 2,
        },
      },
    }),
    backgroundColor: '#D3D3D3',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  draggableArea: {
    width: 132,
    height: 32,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    marginTop: 8,
    width: 100,
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 10,
  },
  list: {
    flex: 1,
  },
  listContainer: {},
  stop: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
  },
  icon: {
    marginTop: 20,
    marginLeft: 15,
  },
  info: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 30,
    marginTop: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#000',
    marginTop: 15,
  },
});

export default MapScreen;

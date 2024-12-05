import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Modal,
  FlatList,
} from 'react-native';


const availableActions = [
  { label: 'Move X by 50' },
  { label: 'Move Y by 50' },
  { label: 'Rotate 360' },
  { label: 'Go to (0,0)' },
  { label: 'Increase Size' },
  { label: 'Decrease Size' },
];


const DraggableSprite = ({ sprite, onSelect, animationRefs }) => {
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: animationRefs.translateX, dy: animationRefs.translateY }],
      { useNativeDriver: false },
    ),
    onPanResponderRelease: () => {
      sprite.x = animationRefs.translateX._value;
      sprite.y = animationRefs.translateY._value;
    },
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.sprite,
        {
          transform: [
            { translateX: animationRefs.translateX },
            { translateY: animationRefs.translateY },
            {
              rotate: animationRefs.rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }),
            },
            { scale: animationRefs.scale },
          ],
        },
      ]}>
      <TouchableOpacity onPress={() => onSelect(sprite)}>
        <Image source={sprite.image} style={styles.spriteImage} />
      </TouchableOpacity>
    </Animated.View>
  );
};


const ActionModal = ({
  visible,
  onClose,
  sprite,
  onActionSelect,
  onDeleteAction,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Manage Actions</Text>
        <View style={styles.actionSection}>
       
          <View style={styles.actionList}>
            <Text style={styles.sectionTitle}>Available Actions</Text>
            <FlatList
              data={availableActions}
              keyExtractor={item => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => onActionSelect(item)}>
                  <Text style={styles.actionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
         
          <View style={styles.selectedActionList}>
            <Text style={styles.sectionTitle}>Selected Actions</Text>
            <FlatList
              data={sprite?.actions || []}
              keyExtractor={(item, index) => `${item.label}-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.selectedActionItem}>
                  <Text style={styles.selectedActionText}>{item.label}</Text>
                  <TouchableOpacity onPress={() => onDeleteAction(index)}>
                    <Text style={styles.deleteActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
          <Text style={styles.modalCloseText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);


const App = () => {
  const [sprites, setSprites] = useState([
    {
      id: 'cat',
      image: require('./assets/cat.png'),
      x: 0,
      y: 0,
      actions: [],
    },
  ]);

  const animationRefs = useRef(
    sprites.reduce((acc, sprite) => {
      acc[sprite.id] = {
        translateX: new Animated.Value(sprite.x),
        translateY: new Animated.Value(sprite.y),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1),
      };
      return acc;
    }, {}),
  ).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSprite, setSelectedSprite] = useState(null);

  const handleSelectSprite = sprite => {
    setSelectedSprite(sprite);
    setModalVisible(true);
  };

  const handleActionSelect = action => {
    const updatedSprite = { ...selectedSprite, actions: [...selectedSprite.actions, action] };
    setSprites(prev =>
      prev.map(sprite => (sprite.id === selectedSprite.id ? updatedSprite : sprite)),
    );
  };

  const handleDeleteAction = index => {
    const updatedSprite = {
      ...selectedSprite,
      actions: selectedSprite.actions.filter((_, i) => i !== index),
    };
    setSprites(prev =>
      prev.map(sprite => (sprite.id === selectedSprite.id ? updatedSprite : sprite)),
    );
  };

  const handlePlay = () => {
    sprites.forEach(sprite => {
      sprite.actions.forEach(action => {
        switch (action.label) {
          case 'Move X by 50':
            Animated.timing(animationRefs[sprite.id].translateX, {
              toValue: animationRefs[sprite.id].translateX._value + 50,
              duration: 500,
              useNativeDriver: true,
            }).start();
            break;
          case 'Move Y by 50':
            Animated.timing(animationRefs[sprite.id].translateY, {
              toValue: animationRefs[sprite.id].translateY._value + 50,
              duration: 500,
              useNativeDriver: true,
            }).start();
            break;
          case 'Rotate 360':
            Animated.timing(animationRefs[sprite.id].rotation, {
              toValue: animationRefs[sprite.id].rotation._value + 360,
              duration: 1000,
              useNativeDriver: true,
            }).start();
            break;
          case 'Go to (0,0)':
            Animated.parallel([
              Animated.timing(animationRefs[sprite.id].translateX, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(animationRefs[sprite.id].translateY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]).start();
            break;
          case 'Increase Size':
            Animated.timing(animationRefs[sprite.id].scale, {
              toValue: 1.5,
              duration: 500,
              useNativeDriver: true,
            }).start();
            break;
          case 'Decrease Size':
            Animated.timing(animationRefs[sprite.id].scale, {
              toValue: 0.5,
              duration: 500,
              useNativeDriver: true,
            }).start();
            break;
          default:
            break;
        }
      });
    });
  };

  const handleAddSprite = () => {
    const newId = `sprite${sprites.length + 1}`;
    const newSprite = {
      id: newId,
      image: require('./assets/ball.png'),
      x: 50,
      y: 50,
      actions: [],
    };

    animationRefs[newId] = {
      translateX: new Animated.Value(newSprite.x),
      translateY: new Animated.Value(newSprite.y),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
    };

    setSprites([...sprites, newSprite]);
  };

  const handleRefresh = () => {
    Object.values(animationRefs).forEach(ref => {
      ref.translateX.setValue(0);
      ref.translateY.setValue(0);
      ref.rotation.setValue(0);
      ref.scale.setValue(1);
    });
    setSprites(
      sprites.map(sprite => ({
        ...sprite,
        actions: [],
      })),
    );
  };

  return (
    <View style={styles.container}>
    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scratch</Text>
      </View>

     
      <View style={styles.canvas}>
        {sprites.map(sprite => (
          <DraggableSprite
            key={sprite.id}
            sprite={sprite}
            onSelect={handleSelectSprite}
            animationRefs={animationRefs[sprite.id]}
          />
        ))}
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Image
            source={require('./assets/play.png')}
            style={styles.controlIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

     
      <View style={styles.spriteDetails}>
        {sprites.map(sprite => (
          <View key={sprite.id} style={styles.spriteCard}>
            <Image
              source={sprite.image}
              style={styles.spriteThumbnail}
            />
            <Text style={styles.spriteName}>{sprite.id}</Text>
            <TouchableOpacity
              style={styles.addActionButton}
              onPress={() => handleSelectSprite(sprite)}>
              <Text style={styles.addActionText}>Add Actions</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addSpriteButton}
          onPress={handleAddSprite}>
          <Text style={styles.addSpriteText}>Add Sprite</Text>
        </TouchableOpacity>
      </View>

      
      <ActionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        sprite={selectedSprite}
        onActionSelect={handleActionSelect}
        onDeleteAction={handleDeleteAction}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {padding: 20, backgroundColor: '#007bff'},
  headerTitle: {color: '#fff', fontSize: 20, fontWeight: 'bold'},
  canvas: {flex: 1, backgroundColor: '#f5f5f5', position: 'relative'},
  playButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 50,
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  controlIcon: {width: 25, height: 25, tintColor: '#fff'},
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
  refreshText: {color: '#fff', fontWeight: 'bold'},
  sprite: {position: 'absolute'},
  spriteImage: {width: 50, height: 50},
  spriteDetails: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  spriteCard: {alignItems: 'center', marginHorizontal: 10},
  spriteThumbnail: {width: 50, height: 50, marginBottom: 5},
  spriteName: {fontWeight: 'bold'},
  addActionButton: {backgroundColor: '#007bff', padding: 5, borderRadius: 5},
  addActionText: {color: '#fff'},
  addSpriteButton: {
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',height:50
  },
  addSpriteText: {color: '#fff', fontWeight: 'bold'},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  actionSection: {flexDirection: 'row', justifyContent: 'space-between'},
  actionList: {flex: 1, marginRight: 10},
  selectedActionList: {flex: 1, borderLeftWidth: 1, borderColor: '#ccc'},
  sectionTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 10},
  actionItem: {padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'},
  actionText: {fontSize: 16},
  selectedActionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedActionText: {fontSize: 16},
  deleteActionText: {color: '#ff4d4d'},
  modalCloseButton: {marginTop: 10, alignSelf: 'center'},
  modalCloseText: {color: '#007bff', fontSize: 16},
});

export default App;

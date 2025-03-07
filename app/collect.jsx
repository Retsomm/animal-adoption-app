// app/collect.jsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; 
import { useFavorites } from '../contexts/favorites.context.js';
import { useRouter } from 'expo-router';
import { ThemeContext } from '@/contexts/ThemeContext';
const CollectScreen = () => {
  const router = useRouter();
  const { favorites, removeFromFavorites } = useFavorites();
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  const renderFavoriteItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.animalCard}
        onPress={() => router.push(`/item/${item.animal_id}`)}
      >
        <View style={styles.animalInfo}>
          {item.album_file ? (
            <Image 
              source={{ uri: item.album_file }} 
              style={styles.animalImage} 
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../assets/images/default.jpg')} 
              style={styles.animalImage} 
              resizeMode="cover"
            />
          )}
          <View style={styles.animalDetails}>
            <Text style={styles.animalName}>{item.animal_kind} - {item.animal_Variety || '未知品種'}</Text>
            <Text style={styles.animalItem}>地區: {item.animal_place ? item.animal_place.substring(0, 3) : '未知'}</Text>
            <Text style={styles.animalItem}>性別: {item.animal_sex === 'M' ? '公' : item.animal_sex === 'F' ? '母' : '未知'}</Text>
            <Text style={styles.animalItem}>顏色: {item.animal_colour || '未知'}</Text>
            <Text style={styles.animalItem}>體型: {item.animal_bodytype || '未知'}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
        <TouchableOpacity 
  style={styles.removeButton}
  onPress={(e) => {
    e.stopPropagation();
    removeFromFavorites(item);
  }}
>
  <FontAwesome name="heart" size={24} color="red" />
  <Text style={styles.favoriteButtonText}>取消收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => router.push(`/item/${item.animal_id}`)}
        >
          <FontAwesome name="info-circle" size={24} color="#4a80f5" />
          <Text style={styles.detailButtonText}>詳細資料</Text>
        </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        <Text style={styles.noFavoritesText}>尚無收藏的動物</Text>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.animal_id}
          style={styles.animalList}
        />
      )}
    </View>
  );
};
function createStyles(theme, colorScheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
    color: theme.text
  },
  animalList: {
    flex: 1,
    padding: 10,
    width: '100%',
    color: theme.text,
  },
  animalCard: {
    backgroundColor: theme.background,
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    color: theme.text
  },
  animalInfo: {
    flexDirection: 'row',
  },
  animalImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  noImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginLeft: 30,
    backgroundColor: theme.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  animalDetails: {
    flex: 1,
    color:theme.text,
    justifyContent:'center',
    marginLeft: 50,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.text
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorScheme === 'dark' ? "black" : "white",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    borderColor:colorScheme === 'dark' ? "white" : "black",
    borderWidth:1
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorScheme === 'dark' ? "black" : "white",
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    borderColor:colorScheme === 'dark' ? "white" : "black",
    borderWidth:1
  },
  detailButtonText: {
    marginLeft: 5,
    color: theme.text
  },
  favoriteButtonText: {
    marginLeft: 5,
    color: theme.text
  },
  noFavoritesText: {
    fontSize: 18,
    color: theme.text
  },
  animalItem:{
    color:theme.text,
    marginBottom:5,
  },
  });
}
export default CollectScreen;
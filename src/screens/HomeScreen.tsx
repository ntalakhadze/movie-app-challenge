import axios from "axios";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  TouchableHighlight,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useNetInfo } from "@react-native-community/netinfo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";

const HomeScreen: React.FC = () => {
  const apiUrl = "http://www.omdbapi.com/?apikey=d22e36d1";
  const netInfo = useNetInfo();

  const [state, setState] = useState({
    search: "",
    results: [],
    selected: {},
    favorites: [],
    deleted: [],
  });

  const searchResults = async function () {
    try {
      const res = await axios(`${apiUrl}&s=${state.search}`);
      const data = res?.data?.Search;

      setState((previousState) => {
        return {
          ...previousState,
          results:
            data?.filter(
              (movie: any) => !state.deleted.includes(movie.imdbID)
            ) || [],
        };
      });
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };
  //change with string literal
  const selectByID = (id: string) => {
    axios(apiUrl + "&i=" + id).then(({ data }) => {
      let idResult = data;
      console.log(idResult);
      setState((previousState) => {
        return { ...previousState, selected: idResult };
      });
    });
  };

  const setFav = async function () {
    const selectedFav = JSON.stringify([...state.favorites, state.selected]);
    state.favorites.includes(state.selected)
      ? alert("already added")
      : setState((previousState: any) => {
          return {
            ...previousState,
            favorites: [...previousState.favorites, state.selected],
          };
        });

    try {
      await AsyncStorage.setItem("favorite", selectedFav);
    } catch (err) {
      console.log(err);
    }
  };

  const setDeleted = async function () {
    const selectedDel = JSON.stringify([
      ...state.deleted,
      state.selected.imdbID,
    ]);
    setState((previousState: any) => {
      return {
        ...previousState,
        deleted: [...previousState.deleted, state.selected.imdbID],
      };
    });
    try {
      await AsyncStorage.setItem("deleted", selectedDel);
    } catch (err) {
      console.log(err);
    }
  };

  const getFavorites = async () => {
    // await AsyncStorage.removeItem("favorite");
    try {
      const jsonValue = await AsyncStorage.getItem("favorite");

      return jsonValue != null
        ? setState((previousState: any) => {
            return {
              ...previousState,
              favorites: [...previousState.favorites, ...JSON.parse(jsonValue)],
            };
          })
        : null;
    } catch (e) {
      // error reading value
    }
  };
  const getDeleted = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("deleted");

      return jsonValue != null
        ? setState((previousState: any) => {
            return {
              ...previousState,
              deleted: [...previousState.deleted, ...JSON.parse(jsonValue)],
            };
          })
        : null;
    } catch (e) {
      // error reading value
    }
  };

  React.useEffect(() => {
    getFavorites();
    getDeleted();
  }, []);
  return netInfo.isConnected ? (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="position">
          <Text style={styles.header}>Movies & TV Shows</Text>

          <Text style={styles.subHeader}>My favorites</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.favoritesContainer}>
              {state.favorites.map((favItem) => (
                <TouchableHighlight
                  underlayColor={"transparent"}
                  onPress={() => selectByID(favItem.imdbID)}
                  key={favItem.imdbID}
                >
                  <View style={styles.favView}>
                    <Text style={styles.favTitle}>{favItem.Title}</Text>
                    <Image
                      resizeMode="cover"
                      style={styles.favPoster}
                      source={{ uri: favItem.Poster }}
                    />
                  </View>
                </TouchableHighlight>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.subHeader}>Explore</Text>
          <TextInput
            style={styles.inputStyle}
            placeholderTextColor={"gray"}
            onChangeText={(text) =>
              setState((previousState) => {
                return { ...previousState, search: text };
              })
            }
            value={state.search}
            placeholder="Search"
            onSubmitEditing={searchResults}
          />
          <View style={styles.exploreContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {state.results.map((item) => (
                <TouchableHighlight
                  underlayColor={"transparent"}
                  onPress={() => selectByID(item.imdbID)}
                  key={item.imdbID}
                >
                  <View style={styles.resultView}>
                    <Text style={styles.resultTitle}>{item.Title}</Text>
                    <Image
                      resizeMode="cover"
                      style={styles.resultPoster}
                      source={{ uri: item.Poster }}
                    />
                  </View>
                </TouchableHighlight>
              ))}
            </ScrollView>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={typeof state.selected.Title != "undefined"}
          >
            <BlurView intensity={12} style={styles.blurView}>
              <View style={styles.modalView}>
                <TouchableHighlight
                  underlayColor={"transparent"}
                  style={{ marginTop: 20 }}
                  onPress={() =>
                    setState((previousState) => {
                      return { ...previousState, selected: {} };
                    })
                  }
                >
                  <Ionicons
                    style={styles.iconStyle}
                    name="close"
                    size={32}
                    color="white"
                  />
                </TouchableHighlight>
                <Text style={styles.resultTitle}>{state.selected.Title}</Text>
                <Image
                  style={styles.insideImage}
                  source={{ uri: state.selected.Poster }}
                />
                <Text style={styles.insidePlot}>{state.selected.Plot}</Text>
                <Text style={styles.insideRating}>
                  IMDB Rating : {state.selected.imdbRating}
                </Text>
                <TouchableOpacity
                  underlayColor={"transparent"}
                  onPress={() =>
                    state.favorites.includes(state.selected.imdbID)
                      ? alert("already added")
                      : setFav()
                  }
                >
                  <View style={styles.watchlist}>
                    <Text style={styles.buttonLabel}>Add To Watchlist</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={setDeleted}
                  underlayColor={"transparent"}
                >
                  <View style={styles.hideButton}>
                    <Text style={styles.hideText}>Hide</Text>
                    <Ionicons name="eye" size={20} color={"white"} />
                  </View>
                </TouchableOpacity>
              </View>
            </BlurView>
          </Modal>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  ) : (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 32 }}>No Internet Connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1B2A41",
    flex: 1,
  },
  scrollView: { backgroundColor: "#1B2A41" },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginLeft: 15,
    color: "white",
    marginTop: 50,
  },
  subHeader: {
    fontSize: 26,
    fontWeight: "bold",
    marginLeft: 15,
    color: "white",
    marginTop: 10,
  },

  favoritesContainer: {
    backgroundColor: "transparent",
    marginTop: 8,
    flexDirection: "row",
  },
  favView: {
    shadowColor: "#000",
    borderRadius: 5,
    shadowOffset: {
      width: 5,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    backgroundColor: "transparent",
    alignSelf: "center",
    marginHorizontal: 10,
  },

  favTitle: {
    marginVertical: 10,
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    alignSelf: "center",
    maxWidth: 150,
  },
  favPoster: {
    height: 150,
    width: 100,
    borderRadius: 8,
  },

  inputStyle: {
    height: 30,
    width: "92%",
    borderWidth: 0.5,
    borderRadius: 8,
    color: "black",
    borderColor: "white",
    marginTop: 8,
    alignSelf: "center",
    backgroundColor: "white",
    paddingLeft: 10,
  },

  exploreContainer: {
    backgroundColor: "transparent",
    marginTop: 8,
  },
  insideImage: { width: 150, height: 200, alignSelf: "center" },

  resultView: {
    shadowColor: "#000",
    borderRadius: 5,
    shadowOffset: {
      width: 5,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    backgroundColor: "transparent",
    alignSelf: "center",
    marginHorizontal: 20,
  },
  blurView: { flex: 1 },
  iconStyle: { alignSelf: "flex-end", marginRight: 10 },

  resultTitle: {
    marginVertical: 10,
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    alignSelf: "center",
  },
  resultPoster: {
    height: 300,
    width: 200,
    borderRadius: 8,
  },
  insidePlot: {
    maxWidth: 320,
    maxHeight: 80,
    alignSelf: "center",
    color: "white",
    marginTop: 10,
  },
  modalView: {
    flex: 0.75,
    backgroundColor: "#2D4356",
    marginTop: 120,
    width: "90%",
    alignSelf: "center",
    borderRadius: 8,
  },
  buttonContainer: {
    width: 100,
    height: 60,
    backgroundColor: "blue",
  },
  insideRating: {
    color: "yellow",
    marginTop: 10,
    alignSelf: "center",
  },
  watchlist: {
    height: 32,
    width: 120,
    backgroundColor: "#226F54",
    borderRadius: 48,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
  },
  buttonLabel: {
    alignSelf: "center",
    color: "white",
    fontSize: 12,
  },
  hideButton: {
    height: 32,
    width: 120,
    backgroundColor: "red",
    borderRadius: 48,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  hideText: {
    alignSelf: "center",
    color: "white",
    fontSize: 12,
    marginRight: 5,
  },
});

export default HomeScreen;
